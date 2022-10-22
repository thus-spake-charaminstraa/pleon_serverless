import { Injectable } from '@nestjs/common';
import { APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
import { JwtService } from '@nestjs/jwt';
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from 'jsonwebtoken';
import { ChatConnService } from './chat-conn.service';
import { ChatMessageService } from './chat-message.service';
import { ChatRoomService } from './chat-room.service';

const apiGatewayClient = new ApiGatewayManagementApiClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_WEBSOCKET_API_ENDPOINT,
});

type APIGatewayProxyWebsocketEventV2Connect =
  APIGatewayProxyWebsocketEventV2 & {
    queryStringParameters: any;
  };

@Injectable()
export class ChatLambdaService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly chatConnService: ChatConnService,
    private readonly chatMessageService: ChatMessageService,
    private readonly chatRoomService: ChatRoomService,
  ) {}

  transformError(error: any, message?: string) {
    if (
      error instanceof JsonWebTokenError ||
      error instanceof NotBeforeError ||
      error instanceof TokenExpiredError
    ) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: 'Unauthorized',
        }),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: message || 'Internal server error',
          error,
        }),
      };
    }
  }

  transformResponse(message: string) {
    return {
      statusCode: 200,
      body: message,
    };
  }

  async connect(event: APIGatewayProxyWebsocketEventV2Connect) {
    try {
      const { connectionId } = event.requestContext;
      const authToken = event.queryStringParameters.authorization_credential;
      const { sub: userId } = this.jwtService.verify(authToken);
      await this.chatConnService.create({
        user_id: userId,
        chat_room_id: event.queryStringParameters.chat_room_id,
        connection_id: connectionId,
      });
      return this.transformResponse('Connected');
    } catch (e) {
      return this.transformError(e);
    }
  }

  async disconnect(event: APIGatewayProxyWebsocketEventV2) {
    const { connectionId } = event.requestContext;
    try {
      await this.chatConnService.deleteConn(connectionId);
      return this.transformResponse('Disconnected');
    } catch (e) {
      return this.transformError(e, 'Error disconnecting to chat');
    }
  }

  async handle(event: APIGatewayProxyWebsocketEventV2) {
    if (event.body) {
      const body = JSON.parse(event.body);
      if (body.action === 'sendMessage') {
        const { connectionId } = event.requestContext;
        try {
          const chatRoomId = await this.chatConnService.getChatRoomIdByConnId(
            connectionId,
          );
          const conns = await this.chatConnService.findAll({
            chat_room_id: chatRoomId.toString(),
          });
          await Promise.all(
            conns.map((conn) => {
              return apiGatewayClient.send(
                new PostToConnectionCommand({
                  ConnectionId: conn.connection_id,
                  Data: Buffer.from(
                    JSON.stringify({
                      action: 'sendMessage',
                      body: 'response chatting',
                    }),
                  ),
                }),
              );
            }),
          );
          return {
            statusCode: 200,
            body: 'Message accept',
          };
        } catch (e) {
          console.log(e);
          return {
            statusCode: 500,
            body: JSON.stringify({
              message: 'Error sending chat',
            }),
          };
        }
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: 'Invalid action',
          }),
        };
      }
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid request',
        }),
      };
    }
  }
}

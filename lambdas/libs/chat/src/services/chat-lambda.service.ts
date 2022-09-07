import {
  ChatConnService,
  ChatMessageService,
  ChatRoomService,
} from '@app/chat/services';
import { Injectable } from '@nestjs/common';
import { APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';

const apiGatewayClient = new ApiGatewayManagementApiClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_WEBSOCKET_API_ENDPOINT,
});

type APIGatewayProxyWebsocketEventV2Connect = APIGatewayProxyWebsocketEventV2 & {
  queryStringParameters: any;
};

@Injectable()
export class ChatLambdaService {
  constructor(
    private readonly chatConnService: ChatConnService,
    private readonly chatMessageService: ChatMessageService,
    private readonly chatRoomService: ChatRoomService,
  ) {}

  async connect(event: APIGatewayProxyWebsocketEventV2Connect) {
    const { connectionId } = event.requestContext;
    try {
      await this.chatConnService.create({
        user_id: event.queryStringParameters.user_id,
        chat_room_id: event.queryStringParameters.chat_room_id,
        connection_id: connectionId,
      });
    } catch (e) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Error connecting to chat',
        }),
      };
    }
    return {
      statusCode: 200,
      body: 'Connected',
    };
  }

  async disconnect(event: APIGatewayProxyWebsocketEventV2) {
    const { connectionId } = event.requestContext;
    try {
      await this.chatConnService.deleteConn(connectionId);
    } catch (e) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Error disconnecting to chat',
        }),
      };
    }
    return {
      statusCode: 200,
      body: 'Disconnected',
    };
  }

  async handle(event: APIGatewayProxyWebsocketEventV2) {
    if (event.body) {
      const body = JSON.parse(event.body);
      console.log(body);
      if (body.action === 'sendMessage') {
        const { connectionId } = event.requestContext;
        console.log(connectionId);
        try {
          const chatRoomId = await this.chatConnService.getChatRoomIdByConnId(
            connectionId,
          );
          console.log(chatRoomId);
          const conns = await this.chatConnService.findAll({
            chat_room_id: chatRoomId.toString(),
          });
          console.log(conns);
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

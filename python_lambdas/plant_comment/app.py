from transformers import AutoModelWithLMHead, AutoModelForCausalLM, AutoTokenizer
from typing import Tuple, List
from functools import reduce
import torch
import json
import os
if os.environ.get('LAMBDA_TASK_ROOT'):
    os.environ['TRANSFORMERS_CACHE'] = '/tmp/'

ko_doctor_dict = {}
ko_feed_dict = {}
ko_noti_dict = {}
ko_user_content_dict = {}

ko_feed_dict['water'] = '나는 물을 마셨어요'
ko_feed_dict['air'] = '나는 바람을 쐬었어요'
ko_feed_dict['repot'] = '너가 오늘 다른 화분으로 나를 분갈이 해줬어요.'
ko_feed_dict['prune'] = '나는 오늘 가지를 정리했어요'
ko_feed_dict['spray'] = '나는 오늘 촉촉해졌어요.'
ko_feed_dict['nutrition'] = '나는 영양제를 먹었어요'
ko_feed_dict['today'] = ''
ko_feed_dict['leaf'] = '나는 잎이 더 많아졌어요'
ko_feed_dict['flower'] = '나는 새 꽃이 생겼어요'
ko_feed_dict['fruit'] = '나는 열매가 생겼어.'
ko_feed_dict['etc'] = ''

ko_doctor_dict['water_lack'] = '그리고 나는 목이 말라요.'
ko_doctor_dict['water_excess'] = '그리고 나는 물을 너무 많이 마셨어요.'
ko_doctor_dict['light_excess'] = '그리고 요즘 해가 너무 뜨거워요.'
ko_doctor_dict['humidity_lack'] = '그리고 공기가 너무 건조해요.'
ko_doctor_dict['temperature_excess'] = '그리고 날씨가 너무 더워요.'
ko_doctor_dict['temperature_lack'] = '그리고 날씨가 너무 추워요.'
ko_doctor_dict['nutrition_lack'] = '그리고 나는 영양소 섭취가 부족해요.'
ko_doctor_dict['nutrition_excess'] = '그리고 나는 영양소 섭취가 충분해요.'
ko_doctor_dict['insect_desease'] = '그리고 나는 병해충이 있어요.'

ko_noti_dict['water'] = '그리고 나는 물이 마시고 싶어요.'
ko_noti_dict['air'] = '그리고 나는 신선한 공기를 쐬고 싶어요.'
ko_noti_dict['repot'] = '그리고 나는 새 화분에 들어가고 싶어요.'
ko_noti_dict['prune'] = '그리고 나는 가지치기 하고 싶어요.'
ko_noti_dict['spray'] = '그리고 나는 수분으로 촉촉하고 싶어요.'
ko_noti_dict['nutrition'] = '그리고 나는 영양제를 먹고 싶어요.'

ko_user_content_dict['water'] = '물 많이 마셔서 좋지?'
ko_user_content_dict['air'] = '오늘 너에게 환기해줬어. 신선한 공기 마시니까 어때?'
ko_user_content_dict['repot'] = '오늘 너를 새 화분으로 분갈이했어. 새 화분으로 이사하니까 좋지?'
ko_user_content_dict['prune'] = '오늘 가지를 정리해줬어.'
ko_user_content_dict['spray'] = '오늘 너를 촉촉하게 해줬어. 너 몸을 촉촉하게 해주니까 어때?'
ko_user_content_dict['nutrition'] = '오늘 너에게 영양제 줬어. 맛있어?'
ko_user_content_dict['today'] = '요즘 행복하지!'
ko_user_content_dict['leaf'] = '너한테 새 잎이 생겼어!'
ko_user_content_dict['flower'] = '너한테 이쁜 꽃이 피었어!'
ko_user_content_dict['fruit'] = '너한테 열매가 열려서 기분이 좋지? '
ko_user_content_dict['etc'] = '너는 오늘 어때?'

tokenizer = AutoTokenizer.from_pretrained('gpt2_saved_model')
model = AutoModelWithLMHead.from_pretrained('gpt2_saved_model')


def preprocess_feed_content(feed) -> Tuple[str, str]:
    ret = ''
    if not feed:
        return ret
    return ko_feed_dict[feed['kind']], ko_user_content_dict[feed['kind']]


def preprocess_comments(comments: list) -> list:
    ret = []
    turn = {
        'author_kind': 'user',
        'content': ''
    }
    if not comments:
        return ret
    for comment in comments:
        if len(turn['content']) == 0 or turn['author_kind'] == comment['author_kind']:
            turn['author_kind'] = comment['author_kind']
            turn['content'] += ' ' + comment['content']
        else:
            ret.append(turn)
            turn = {
                'author_kind': 'user',
                'content': ''
            }
            turn['author_kind'] = comment['author_kind']
            turn['content'] += ' ' + comment['content']
    ret.append(turn)
    return ret

def preprocess_diagnosis(diagnosis: list) -> str:
    ret = ''
    if not diagnosis:
        return ret
    for cause in diagnosis[0]['causes']:
        ret += ko_doctor_dict[cause['cause']] + ' '
    return ret


def preprocess_notis(notis: list) -> str:
    ret = ''
    if not notis:
        return ret
    for noti in notis:
        ret += ko_noti_dict[noti['kind']] + ' '
    return ret


def handler(event, context):
    try:
        body = json.loads(event['body'])
    except:
        body = event['body']

    if body == 'warming':
        print('warming up...')
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
            },
            'body': json.dumps({
                'message': 'Warm up'
            })
        }

    feeds = body['data']

    result = []
    for feed in feeds:
        feed_context, feed_user_content_context = preprocess_feed_content(feed)
        # feed_context = ''
        comment_turn_list = preprocess_comments(feed['comments'])
        # noti_context = preprocess_notis(feed['notis'])
        noti_context = ''
        # diagnosis_context = preprocess_diagnosis(feed['diagnosis'])
        diagnosis_context = ''
        bot_response = ''
        
        if len(comment_turn_list) > 7:
            comment_turn_list = comment_turn_list[-8:]
            chat_history_str = ''
            for comment_turn_obj in comment_turn_list:
                chat_history_str += tokenizer.cls_token + \
                    comment_turn_obj['content'] + tokenizer.eos_token
            chat_history = tokenizer.encode(
                chat_history_str, return_tensors='pt')

            chat_generated_history = model.generate(
                chat_history, max_length=1000, pad_token_id=tokenizer.eos_token_id)

            bot_response = tokenizer.decode(
                chat_generated_history[:, chat_history.shape[-1]:][0], skip_special_tokens=True)
        else:
            context = f'나는 식물이고 너가 내 주인이야. {feed_context} {diagnosis_context} {noti_context} {tokenizer.eos_token}'
            context += f'{tokenizer.cls_token} {feed_user_content_context}'
            if len(comment_turn_list) > 0:
                if comment_turn_list[0]['author_kind'] == 'user':
                    context += f'{comment_turn_list[0]["content"]}'
                context += tokenizer.eos_token
                for comment_turn_obj in comment_turn_list:
                    context += f'{tokenizer.cls_token} {comment_turn_obj["content"]} {tokenizer.eos_token}'
            else:
                context += tokenizer.eos_token

            chat_history = tokenizer.encode(context, return_tensors='pt')

            chat_generated_history = model.generate(
                chat_history, max_length=1000, pad_token_id=tokenizer.eos_token_id)

            bot_response = tokenizer.decode(
                chat_generated_history[:, chat_history.shape[-1]:][0], skip_special_tokens=True)

        result.append({
            'feed_id': feed['feed_id'],
            'plant_id': feed['plant_id'],
            'owner': feed['owner'],
            'created_at': feed['created_at'],
            'bot_response': bot_response
        })

        print(comment_turn_list)
        print('plant: ', feed_context, diagnosis_context, noti_context, '|| user : ', feed_user_content_context)
        print('bot : ' + bot_response, end='\n')

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
        },
        'body': json.dumps({
            'data': result,
        })
    }

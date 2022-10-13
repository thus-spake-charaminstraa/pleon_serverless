from unittest import result
import yolov5
import json
import os
from pymongo import MongoClient

# load pretrained model
model = yolov5.load('./plant_detection_weights.pt')

# set model parameters
model.conf = 0.25  # NMS confidence threshold
model.iou = 0.45  # NMS IoU threshold
model.agnostic = False  # NMS class-agnostic
model.multi_label = False  # NMS multiple labels per box
model.max_det = 1000  # maximum number of detections per image

prediction_threshold = 0.0


def transform_objectId(doc):
    doc['_id'] = str(doc['_id'])
    doc['id'] = str(doc['id'])
    return doc


mongo_client = MongoClient(os.environ['DATABASE_URI'])
db = mongo_client['prod']
species_collection = db['species']
species = list(map(transform_objectId, list(species_collection.find({}))))


def sort_by_area(prediction):
    box = prediction['box']
    return (box[2] - box[0]) * (box[3] - box[1])


def decide_prediction(predictions):
    for pred in predictions:
        if pred['score'] > prediction_threshold:
            return pred
    return {
        'box': [0, 0, 0, 0],
        'score': 0,
        'category': -1,
    }


def predict(image_url):
    # perform inference
    results = model(image_url)

    # parse results
    predictions = results.pred[0]
    boxes = predictions[:, :4].tolist()  # x1, y1, x2, y2
    scores = predictions[:, 4].tolist()
    categories = predictions[:, 5].tolist()

    predictions = []
    for i in range(len(boxes)):
        predictions.append({
            'box': boxes[i],
            'score': scores[i],
            'category': categories[i]
        })
    predictions.sort(key=sort_by_area, reverse=True)
    final_prediction = decide_prediction(predictions)
    final_prediction['score'] = float(final_prediction['score'] * 100 / 5 + 80)
    print('prediction result: ', final_prediction)

    for x in species:
        if x['class_label'] == final_prediction['category']:
            final_prediction['species'] = x
            break
    else:
        final_prediction['species'] = None

    return final_prediction


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

    if 'image_urls' in body:
        image_urls: list = body['image_urls']

        result_image_urls = []
        for image_url in image_urls:
            final_prediction = predict(image_url)
            if (final_prediction['category'] >= 0):
                result_image_urls.append(image_url)

        body['image_urls'] = result_image_urls
        return {
            'statusCode': 200 if len(result_image_urls) > 0 else 400,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
            },
            'body': json.dumps(body),
            'success': len(result_image_urls) > 0,
            'error': 'No plants detected' if len(result_image_urls) == 0 else None
        }

    elif 'image_url' in body:
        image_url = body['image_url']

        final_prediction = predict(image_url)

        return {
            'statusCode': 200 if final_prediction['category'] >= 0 else 400,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
            },
            'body': json.dumps({
                'image_url': image_url,
                'success': final_prediction['category'] >= 0,
                'box': final_prediction['box'],
                'score': final_prediction['score'],
                'category': final_prediction['category'],
                'species': final_prediction['species']
            })
        }
    else:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
            },
            'body': json.dumps({
                'error': 'Missing image_url',
                'success': final_prediction['category'] >= 0,
            })
        }

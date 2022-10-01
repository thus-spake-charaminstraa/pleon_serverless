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


def handler(event, context):
    if json.loads(event['body']) == 'warming':
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

    body = json.loads(event['body'])

    image_url = body['image_url']

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
    print('prediction result: ', final_prediction)
    
    for x in species:
        if x['class_label'] == final_prediction['category']:
            final_prediction['species'] = x
            break
    else:
        final_prediction['species'] = None

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
        },
        'body': json.dumps({
            'image_url': image_url,
            'box': final_prediction['box'],
            'score': final_prediction['score'],
            'category': final_prediction['category'],
            'species': final_prediction['species']
        })
    }

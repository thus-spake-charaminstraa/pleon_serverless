import yolov5
import json

# load pretrained model
model = yolov5.load('./plant_doctor_weights.pt')

# set model parameters
model.conf = 0.25  # NMS confidence threshold
model.iou = 0.45  # NMS IoU threshold
model.agnostic = False  # NMS class-agnostic
model.multi_label = False  # NMS multiple labels per box
model.max_det = 1000  # maximum number of detections per image


def handler(event, context):
    print(event)

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
            'body': 'Warm up',
        }

    image_urls: list = list(body['image_urls'])

    results = []

    for url in image_urls:
        # perform inference
        result = model(url)

        # parse results
        predictions = result.pred[0]
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
        results.append(predictions)

    print(results)

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
        },
        'body': json.dumps({
            'result': results,
            'plant_id': body.get('plant_id', None)
        })
    }

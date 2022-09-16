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
    if event['body'] == 'warming':
        print('warming up...')
        return {
            'statusCode': 200,
            'body': 'Warm up',
        }

    body = json.loads(event['body'])

    image_url = body['image_url']

    # perform inference
    results = model(image_url)

    # parse results
    predictions = results.pred[0]
    boxes = predictions[:, :4]  # x1, y1, x2, y2
    scores = predictions[:, 4]
    categories = predictions[:, 5]
    print('prediction result: ', predictions.tolist()[0])

    return {
        'statusCode': 200,
        'body': json.dumps({
            'image_url': image_url,
            'predictions': json.dumps({
                'boxes': boxes.tolist(),
                'scores': scores.tolist(),
                'categories': categories.tolist(),
            }),
        })
    }

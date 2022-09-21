import yolov5
import json

# load pretrained model
model = yolov5.load('./plant_detection_weights.pt')

# set model parameters
model.conf = 0.25  # NMS confidence threshold
model.iou = 0.45  # NMS IoU threshold
model.agnostic = False  # NMS class-agnostic
model.multi_label = False  # NMS multiple labels per box
model.max_det = 1000  # maximum number of detections per image

prediction_threshold = 0.5

def sort_by_area(prediction):
    box = prediction['box']
    return (box[2] - box[0]) * (box[3] - box[1])

def decide_prediction(predictions):
    for pred in predictions: 
        if pred['score'] > prediction_threshold:
            return pred;
    return None;

def handler(event, context):
    print(event);
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
    boxes = predictions[:, :4].tolist()  # x1, y1, x2, y2
    scores = predictions[:, 4].tolist()
    classes = predictions[:, 5].tolist()
    
    predictions = [];
    for i in range(len(boxes)):
        predictions.append({
            'box': boxes[i],
            'score': scores[i],
            'class': classes[i]
        })
    predictions.sort(key=sort_by_area, reverse=True)
    
    print('prediction result: ', predictions[0])
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'image_url': image_url,
            'box': json.dumps(boxes),
            'score': json.dumps(scores),
            'class': json.dumps(classes),
        })
    }

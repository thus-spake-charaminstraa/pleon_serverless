export const notiModalContent: NotiModal[] = [
  {
    name: 'event',
    title: '이벤트',
    content:
      '"#이벤트" 를 태그하고\n식물과 찍은 셀카를 올려주시면\n추첨을 통해 3명에게\n<스타벅스 아메리카노>\n를 드립니다.\n\n~11월 22일까지',
    button: true,
    image_url:
      'https://pleon-image-main.s3.ap-northeast-2.amazonaws.com/event_resource_image.png',
  },
];

export class NotiModal {
  name: string;

  title: string;

  content: string;

  button: boolean;

  image_url: string;
}

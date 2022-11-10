export const notiModalContent: NotiModal[] = [
  {
    name: 'event',
    title: '이벤트',
    content:
      '"#이벤트" 를 태그하고 식물과 찍은 셀카를 올려주시면 추첨을 통해 3명에게 "스타벅스 아메리카노"를 드립니다.\n~11월 22일까지',
  },
];

export class NotiModal {
  name: string;

  title: string;

  content: string;
}

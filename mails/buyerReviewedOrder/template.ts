type Args = {
  buyer_name: string;
  rating: number;
  review: string;
};

export default function ({ buyer_name, rating, review }: Args) {
  return `
<div>
  <h2 style='font-size: 20px;'>${buyer_name} submitted a review about their order</h2>
  <p>
    The item was rated <b>${rating}</b> out of <b>5</b>
  </p>
  <p>
    Review:
    <br/>
    "${review}"
    </p>
</div>
 `;
}

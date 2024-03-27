const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(
  "sk_test_51IsL6lH8ikLEaw8WZ1NjzuUaznHBoOLxCYcK1hcDp2yx3lafCW7iCsCce2sDc75ieom5at71Z7SZYwzS9JWGB9Z800XpUVGtcV"
);
const { v4: uuidv4 } = require("uuid");

const app = express();

/** middleare */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

/** routes */
app.get("/", (req, res) => {
  res.send("IT WORKS AT LEARNCODELINE");
});

app.post("/payment", (req, res) => {
  const { product, token } = req.body;

  // logs
  console.log("PRODUCT : ", product);
  console.log("PRICE : ", product.price);

  const idempotency_key = uuidv4();

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
          description: `Purchase of ${product.name}`,
          shipping: {
            name: token.card.name,
            address: {
              country: token.card.address_country,
            },
          },
        },
        { idempotency_key }
      );
    })
    .then((result) => res.status(200).json(result))
    .catch((error) => console.log(error));
});

/** listen */
app.listen(8282, () => console.log("Listening at port 8282"));

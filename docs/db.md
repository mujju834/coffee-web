**Order Document**
{
  "_id": {
    "type": "ObjectId",
    "required": true,
    "description": "A unique identifier for the order. Generated automatically."
  },
  "userId": {
    "type": "ObjectId",
    "required": true,
    "description": "The ID of the user who placed the order."
  },
  "orderDate": {
    "type": "ISODate",
    "required": true,
    "description": "The date and time when the order was placed. Automatically recorded upon order creation."
  },
  "orderItems": {
    "type": "Array",
    "required": true,
    "description": "An array of objects representing the menu items ordered by the user.",
    "items": [
      {
        "itemId": {
          "type": "ObjectId",
          "required": true,
          "description": "The ID of the menu item ordered."
        },
        "itemName": {
          "type": "String",
          "required": true,
          "description": "The name of the menu item."
        },
        "quantity": {
          "type": "Number",
          "required": true,
          "description": "The quantity of the menu item ordered."
        },
        "price": {
          "type": "Number",
          "required": true,
          "description": "The price of a single unit of the menu item."
        },
        "subtotal": {
          "type": "Number",
          "required": true,
          "description": "The subtotal for this menu item (quantity * price)."
        }
      }
    ]
  },
  "totalAmount": {
    "type": "Number",
    "required": true,
    "description": "The total amount for the order, including all ordered items and discounts."
  },
  "orderStatus": {
    "type": "String",
    "required": true,
    "enum": ["Pending", "Processing", "Delivered", "Cancelled"],
    "description": "The current status of the order. Possible values include 'Pending', 'Processing', 'Delivered', and 'Cancelled'."
  },
  "paymentStatus": {
    "type": "String",
    "required": true,
    "enum": ["Paid", "Unpaid"],
    "description": "The payment status of the order. Possible values include 'Paid' and 'Unpaid'."
  },
  "paymentMethod": {
    "type": "String",
    "required": true,
    "description": "The payment method used for the order (e.g., 'Credit Card', 'Cash on Delivery')."
  },
  "deliveryAddress": {
    "type": "Object",
    "required": true,
    "description": "The delivery address where the order should be delivered.",
    "properties": {
      "street": {
        "type": "String",
        "required": true,
        "description": "The street address."
      },
      "city": {
        "type": "String",
        "required": true,
        "description": "The city."
      },
      "state": {
        "type": "String",
        "required": true,
        "description": "The state or province."
      },
      "postalCode": {
        "type": "String",
        "required": true,
        "description": "The postal code or ZIP code."
      },
      "country": {
        "type": "String",
        "required": true,
        "description": "The country."
      }
    }
  },
  "promotionsApplied": {
    "type": "Array",
    "description": "An array of objects representing promotions applied to the order.",
    "items": [
      {
        "promoCode": {
          "type": "String",
          "description": "The promotion code applied to the order."
        },
        "discountAmount": {
          "type": "Number",
          "description": "The discount amount applied to the order."
        }
      }
    ]
  }
}

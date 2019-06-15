"""
inventory.py
Stripe Payments Demo. Created by Adrienne Dreyfus (@adrind).

Simple library to store and interact with products and SKUs.
These methods are using the Stripe Product API, but we tried to abstract them
from the main code if you'd like to use your own product and order management system instead.
"""

import stripe
import os
from functools import reduce
from fosspay.stripe_types import Product
from dotenv import load_dotenv, find_dotenv
from fosspay.config import _cfg, _cfgi

load_dotenv(find_dotenv())

stripe.api_key = _cfg("stripe-secret")
stripe.api_version = '2019-03-14'

# For product retrieval and listing set API version to 2018-02-28 so that skus are returned.
product_api_stripe_version = '2018-02-28'


class Inventory:
    @staticmethod
    def calculate_payment_amount(items: list) -> int:
        product_list = stripe.Product.list(
            limit=1, stripe_version=product_api_stripe_version)
        product_list_data = product_list['data']
        # TODO change this with list of products
        total = 500
        # for item in items:
        #     sku_id = item['parent']
        #     product = next(
        #         filter(lambda p: p['skus']['data'][0]['id'] == sku_id, product_list_data))
        #     total += (product['skus']['data'][0]['price'] * item['quantity'])
        return total

    @staticmethod
    def get_shipping_cost(id) -> int:
        # This would be a lookup in your database to get the shipping prices
        shipping_cost = {'free': 0, 'express': 500}
        return shipping_cost[id]

    @staticmethod
    def list_products() -> [Product]:
        return stripe.Product.list(limit=1, stripe_version=product_api_stripe_version)

    @staticmethod
    def retrieve_product(product_id) -> Product:
        return stripe.Product.retrieve(product_id, stripe_version=product_api_stripe_version)

    @staticmethod
    def products_exist(product_list: [Product]) -> bool:
        valid_products = ['donation']
        product_list_data = product_list['data']

        return reduce(lambda acc, product: acc and len(product_list_data) == 3 and product['id'] in valid_products,
                      product_list['data'],
                      len(product_list_data) > 0)

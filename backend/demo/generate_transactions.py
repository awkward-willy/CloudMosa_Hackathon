import random

import httpx

# Placeholder for token - replace with actual token or read from file
TOKEN = open("test_data/.token").read().strip()

# API endpoint
URL = "http://localhost:8000/api/transactions/"

# Define transaction types and descriptions
INCOME_TYPES = [
    ("salary", ["Monthly salary", "Paycheck", "Wage payment"]),
]

EXPENSE_TYPES = [
    ("food", ["Grocery shopping", "Restaurant meal", "Coffee"]),
    ("transport", ["Bus fare", "Taxi ride", "Fuel"]),
    ("entertainment", ["Movie ticket", "Concert", "Game purchase"]),
    ("utilities", ["Electricity bill", "Water bill", "Internet"]),
    ("rent", ["Monthly rent", "Apartment payment"]),
    ("shopping", ["Clothes", "Electronics", "Household items"]),
]


def generate_transaction():
    is_income = random.choice([True, False])
    if is_income:
        type_name, descriptions = random.choice(INCOME_TYPES)
    else:
        type_name, descriptions = random.choice(EXPENSE_TYPES)

    description = random.choice(descriptions)
    amount = round(random.uniform(1, 1000), 2)

    return {
        "income": is_income,
        "description": description,
        "amount": amount,
        "type": type_name,
    }


def main(num_transactions=100):
    with httpx.Client() as client:
        for _ in range(num_transactions):
            payload = generate_transaction()
            headers = {"Authorization": f"bearer {TOKEN}"}
            try:
                response = client.post(URL, json=payload, headers=headers)
                if response.status_code == 200:
                    print(f"Posted transaction: {payload}")
                else:
                    print(f"Failed to post: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"Error: {e}")


if __name__ == "__main__":
    main()

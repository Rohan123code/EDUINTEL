import os
from perplexity import Perplexity


def get_embedding(text: str):
    client = Perplexity(api_key=os.environ.get("PERPLEXITY_API_KEY"))

    completion = client.chat.completions.create(
        model="sonar-pro",
        messages=[
            {"role": "user", "content": text}
        ]
    )

    print(completion.choices[0].message.content)
    return completion.choices[0].message.content
    
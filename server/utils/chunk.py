from langchain.text_splitter import CharacterTextSplitter


def chunk_text(text, chunk_size=1000):
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=chunk_size,
        chunk_overlap=200,
        length_function=len
    )
    print("\n🤔 text converted into chunks!!",len(text_splitter.split_text(text)))

    return text_splitter.split_text(text)

import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# El analizador se inicializa de forma perezosa (lazy): así, importar este
# módulo no obliga a descargar el lexicón VADER ni a tener red disponible.
# El recurso solo se descarga/carga la primera vez que se analiza un texto.
_sid = None


def _get_analyzer():
    global _sid
    if _sid is None:
        try:
            nltk.data.find('sentiment/vader_lexicon.zip')
        except LookupError:
            nltk.download('vader_lexicon')
        _sid = SentimentIntensityAnalyzer()
    return _sid


def analyze_sentiment(texto):
    sid = _get_analyzer()
    scores = sid.polarity_scores(texto)
    compound_score = scores['compound']
    if compound_score >= 0.5:
        sentimiento = 'muy positivo'
    elif compound_score >= 0.05:
        sentimiento = 'positivo'
    elif compound_score <= -0.5:
        sentimiento = 'muy negativo'
    elif compound_score <= -0.05:
        sentimiento = 'negativo'
    else:
        sentimiento = 'neutral'
    return sentimiento, compound_score

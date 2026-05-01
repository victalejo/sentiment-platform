import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Descargar recursos necesarios para el análisis de sentimiento (ejecutar una vez)
try:
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError:
    nltk.download('vader_lexicon')

# Inicializar el analizador de sentimientos
sid = SentimentIntensityAnalyzer()

def analyze_sentiment(texto):
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

import requests
import json

with open("company-listing-prefetch.json") as massiveListing:
  with open("company-prefetch-trimmed.json", 'a') as smallerListing:
    raw = massiveListing.read()
    data = json.loads(raw)

    i = 0
    for company in data:
      try:
        query = {'name': company['name'], 'api_key': 'zmsprfmrueqhn9dqt7ds2z87'}
        r = requests.get('http://api.crunchbase.com/v/1/companies/posts', params=query)
        print r.text
        articles = r.json()
        if 'num_posts' in articles and articles['num_posts'] > 20:
          smallerListing.write(json.dumps(articles) + ",\n")

        i += 1
        print "Companies examined: " + str(i) + " of 209,837"
      except (ValueError, IOError) as e:
        print e.__doc__
        print e.message

import csv
import json
import collections

fields = ['key', 'notes', 'en', 'th', 'km', 'vm', 'my']

d = collections.defaultdict(list)
translations = collections.defaultdict(lambda: d)

with open('translated.csv', 'r') as f:
    reader = csv.DictReader(f , fieldnames=fields)
    # header
    reader.next()

    for line in reader:
        section, key = line['key'].split('.')
        translations[section][key] = ["**%s" % line['en'], "[[%s]]" %line['en'], line['vm']]

with open('global.json', 'w') as f:
    json.dump(translations, f, indent=2)

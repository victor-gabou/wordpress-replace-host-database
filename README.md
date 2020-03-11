# wordpress-replace-host-database
Node.js command to replace host in WordPress database

## Simple usage
```
cd /path/to/wordpress-replace-host-database
node index.js https://example.com http://example.local wp_example.sql
```

## Using a config file
```
cd /path/to/wordpress-replace-host-database
node index.js --config config.json wp_example.sql
```
config.json
```json
[
  {
    "from": "https://fr.example.com",
    "to": "http://fr.example.local"
  },
  {
    "from": "https://example.com",
    "to": "http://example.local"
  }
]
```

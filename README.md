# cyber-security
OSINT microservices architecture using Apache Kafka for message exchange.

Welcome to the Cyber-Security repository for Web scraping and Entity Extraction. Whitin the packages folder you’ll find both projects.

**Web scraper:**
This is a scraper build using TypeScript and Puppeteer. Its self-contained and produces a JSON file with alle collected objects. 
It is originally built for www.nu.nl.

Using the config.json file you can change selectors and set the timer for the scraper. In the current built the timer is set to 2 minutes for testing purposes. 

The scraper can be used for different sections of nu.nl but must be altered if used with different news sites.

Simple instructions (refer to README.MD for detailed instructions):

```bash
npm i      		#	to install dependencies 
npm start 	  # to start compile (in watch mode)
npm run node  # to run
```

**When running:**
- You must accept the Cookie notification on screen manually 
- To stop the automated process type Ctrl+c, then Yes (Y)
- data will be saved to data/baseline.json

The config.json file in src/config.json. This file contains variables used to select elements on the webpage.

There is also an "IdleTimeMin" that allows the user to decide how many minutes the program waits before scraping again.


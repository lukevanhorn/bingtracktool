Bing Track Tool
=======
Author: Luke Van Horn, Microsoft, 2015
License: MIT, open source

This is a very simple tool for visualizing track data provided in csv format.  It uses the AJAX Control, Version 7.0

##API Key
Register as a developer to get a Bing Maps get an API key: 
https://msdn.microsoft.com/en-us/library/ff428642.aspx

##API Documentation
https://msdn.microsoft.com/en-us/library/gg427610.aspx

##Data Format

A csv with headers in the first line

Required fields: 

	latitude
	longitude
	
##Server

This uses a very simple native node.js webserver I developed for a simple way to serve files, basic route handling, upload and downlaod.  
I find it works very well with Azure web apps.

## Setup:

Signup for an Azure trial account or login to your account: [Azure Signup Page](http://windowsazure.com)


Using the [Azure Management Portal](https://manage.windowsazure.com)

* Create a New Web App (website)
* Select Set up deployment from source control
* Select "External Repository"
* Clone this repository: https://github.com/lukevanhorn/bingtracktool.git
* Enable "Edit in Visual Studio Online" on the configuration tab
* Click the "Edit in Visual Studio Online" link that now appears on the dashboard (right hand menu)
* Navigate to the /public/index.html file
* Enter your bing maps api key in the index.html near line 29:

	credentials:"insert your bing maps key",
	
* Click the run button

# richerTextFSC
Rich Text enhancements for Flows

1)	Block disallowed words and symbols
    a.	Control whether this is a block that prevents next/finish of flow.
2)	Search and Replace custom text
3)	Auto-Replace suggested words
4)	Revert mass changes from search/replace or suggested words


|Parameter	               |I	   |O	     |Information 
|--------------------------|-----|-------|-------------------------------------------------------------------------------|
|autoReplaceMap	           |X	   |       |JSON formatted key:value map.  (example => {"Test": "GreatTest™"} )            |
|disallowedSymbols	       |X	   |       |Comma-separated list of words to block.  Example: /,@,*                        |
|disallowedWords	         |X    |	     |Comma-separated list of words to block.  Example: bad,worse,worst              |
|hardBlock	               |X	   |	     |Set to True if you want to block Next where disallowed Symbol or Word remains.  Default is false.  If set to True, error messages are also provided      |
|richText	                 |X	   |X	     |Input and output RichText that you’ll be editing                               |

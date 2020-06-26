/*
Flow Lightning Web Component:  richerTextFSC
Created By:  Nick Sauer
Advised By:  Alex Edelstein
Created Date:  06/25/2020
*/
import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class RicherTextFSC extends LightningElement {

    //Input and Output Attributes for Flow
    @api richText;
    @api disallowedWordsList;
    @api disallowedSymbolsList;
    @api autoReplaceMap;
    @api hardBlock = false;

    //Validation hook to use standard in Flow
    @api validate(){
        if(!this.hardBlock || (this.hardBlock && this.isValidCheck)){
            return {isValid:true};
        }else{
            return {
                isValid:false,
                errorMessage: 'Cannot Advance - Invalid Symbols/Words Remaind in Rich Text'
            };
        }
    }

    //Other Variables
    @track disallowedWordsArray = [];
    @track disallowedWords;
    @track disallowedWordsMessage;
    @track disallowedSymbolsArray = [];
    @track disallowedSymbols;
    @track disallowedSymbolsMessage;
    @track searchTerm = '';
    @track replaceValue = '';
    @track interimValue = '';
    @track symbolsNotAllowed;
    @track wordsNotAllowed;
    @track oldRichText;
    @track selectTrue = false;
    @track searchTerm = false;
    @track allowRevert = false;
    @track autoReplaceEnabled = false;
    @track disallowedType = 'warning';
    @track disallowedMode = 'dismissable';
    replaceMap = {};
    regTerm = '';
    applyTerm = '';
    symbolTitle = 'Invalid Symbols';
    wordTitle = 'Invalid Words';

    //Begin functionality

    //Set initial values on load
    connectedCallback() {
        console.log('this disallowed symbol: '+this.disallowedSymbolsList);
        if(this.disallowedSymbolsList != undefined){
            this.disallowedSymbolsMessage = 'Do Not Use the Following Symbols: '+this.disallowedSymbolsList;
            this.disallowedSymbolsArray = this.disallowedSymbolsList.replace(/\s/g,'').split(',');
            for(let i=0; i<this.disallowedSymbolsArray.length; i++){
                if(i == 0){
                    if(this.disallowedSymbolsArray.length != 1){
                        this.disallowedSymbols = '['+ this.disallowedSymbolsArray[i] + '|';
                    }else{
                        this.disallowedSymbols = '['+ this.disallowedSymbolsArray[i] + ']';
                    }
                } else if (i == (this.disallowedSymbolsArray.length - 1)){
                    this.disallowedSymbols = this.disallowedSymbols.concat(this.disallowedSymbolsArray[i] + ']');
                } else {
                    this.disallowedSymbols = this.disallowedSymbols.concat(this.disallowedSymbolsArray[i] + '|');
                }
            }
        }

        console.log('this disallowed words: '+this.disallowedWordsList);
        if(this.disallowedWordsList != undefined){
            this.disallowedWordsMessage = 'Do Not Use the Following Words: '+this.disallowedWordsList;
            this.disallowedWordsArray = this.disallowedWordsList.replace(/\s/g,'').split(',');
            console.log('disallowed words array: '+this.disallowedWordsArray);
            for(let i=0; i<this.disallowedWordsArray.length; i++){
                if(i == 0){
                    if(this.disallowedWordsArray.length != 1){
                        this.disallowedWords = '('+this.disallowedWordsArray[i] + '|';
                    }else{
                        this.disallowedWords = '('+this.disallowedWordsArray[i] + ')\\b';
                    }
                } else if (i == (this.disallowedWordsArray.length - 1)){
                    this.disallowedWords = this.disallowedWords.concat(this.disallowedWordsArray[i] + ')\\b');
                } else {
                    this.disallowedWords = this.disallowedWords.concat(this.disallowedWordsArray[i] + '|');
                }
                console.log('running words array: '+this.disallowedWords);
            }
        }
        console.log('existing disallowed: '+this.disallowedSymbols+', '+this.disallowedWords);
        console.log('existing autoReplaceMap: '+this.autoReplaceMap);
        if(this.disallowedSymbols != undefined) this.symbolsNotAllowed = new RegExp(this.disallowedSymbols);
        if(this.disallowedWords != undefined) this.wordsNotAllowed = new RegExp(this.disallowedWords);
        if(this.autoReplaceMap != undefined){
            this.replaceMap = JSON.parse(this.autoReplaceMap);
            this.autoReplaceEnabled = true;
        } 
        this.isValidCheck = true;
        if(this.hardBlock){
            this.disallowedType = 'error';
            this.disallowedMode = 'sticky';
        }
    }

    //Handle updates to Rich Text field
    handleTextChange(event) {
        if (this.symbolsNotAllowed != undefined || this.wordsNotAllowed != undefined) {
            this.interimValue = (event.target.value).toLowerCase();
            this.interimValue = this.interimValue.replace(/(<([^>]+)>)/ig, "");

            if(this.symbolsNotAllowed != undefined){
                if (this.symbolsNotAllowed.test(this.interimValue)) {
                    this.isValidCheck = false;
                    const evt = new ShowToastEvent({
                        title: this.symbolTitle,
                        message: this.disallowedSymbolsMessage,
                        variant: this.disallowedType,
                        mode: this.disallowedMode
                    });
                    this.dispatchEvent(evt);
                }else{
                    this.isValidCheck = true;
                    this.richText = event.target.value;
                }
            }

            if(this.wordsNotAllowed != undefined){
                if (this.wordsNotAllowed.test(this.interimValue)) {
                    this.isValidCheck = false;
                    const evt = new ShowToastEvent({
                        title: this.wordTitle,
                        message: this.disallowedWordsMessage,
                        variant: this.disallowedType,
                        mode: this.disallowedMode
                    });
                    this.dispatchEvent(evt);
                }else{
                    this.isValidCheck = true;
                    this.richText = event.target.value;
                }
            }
        } else {
            this.isValidCheck = true;
            this.richText = event.target.value;
        }
    }

    //Handle initiation of Search and Replace
    handleOpenSearch(event) {
        this.selectTrue = !this.selectTrue;
        if (this.searchButton) this.searchButton = false;
        else this.searchButton = true;
    }

    //Search and Replace Search for Value
    handleSearchChange(event) {
        this.searchTerm = (event.target.value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    //Search and Replace Replace with Value
    handleReplaceChange(event) {
        this.replaceValue = (event.target.value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    //Execute Search and REplace
    searchReplace() {
        this.oldRichText = this.richText;
        this.allowRevert = true;
        let draftValue = this.richText;
        this.searchTerm = this.escapeRegExp(this.searchTerm);
        this.replaceValue = this.escapeRegExp(this.replaceValue);
        draftValue = this.replaceAll(draftValue, this.searchTerm, this.replaceValue);
        this.isValidCheck = true;
        this.richText = draftValue;
    }

    //Execute Auto-Replacement based on map.
    applySuggested(event) {
        this.oldRichText = this.richText;
        this.allowRevert = true;
        let draftValue = this.richText;
        console.log('draftValue in text: ' + draftValue);
        let regTerm = '';
        for (var key in this.replaceMap) {
            console.log('key in loop: ' + key);
            this.applyTerm = this.replaceMap[key];
            this.regTerm = key;
            draftValue = this.replaceAll(draftValue, this.regTerm, this.applyTerm);
        }
        this.isValidCheck = true;
        this.richText = draftValue;
    }

    //Replace All function helper
    replaceAll(str, term, replacement) {
        return str.replace(new RegExp(term, 'ig'), replacement);
    }

    //Undo last change
    handleRevert() {
        this.richText = this.oldRichText;
        this.allowRevert = false;
    }

    //Clean input for RegExp
    escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

}
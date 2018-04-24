import {Indexer, Document} from "ipfsearch-index"
const xmlstream = require("xml-stream")
const zlib = require("zlib")
const fs = require("fs")

let indexer = new Indexer()

let inp
if(process.argv[0]){
    inp = fs.createReadStream(process.argv[0])
}else{
    inp = fs.createReadStream('assets/enwiki-latest-abstract.xml.gz')
}
let unzip = zlib.createGunzip()
let unzippedstream = inp.pipe(unzip)
let xml = new xmlstream(unzippedstream)
let counter = 0

xml.on('endElement: doc', function(doc){
    counter++
    if(counter%30000 === 0){
        console.log(Math.round(counter/55640).toString()+" %") //assuming there are 5,564*10^6 articles in the enwiki and we want the result in %
    }
    indexer.addToIndex(new WikiArticle(doc.url.substring(30),doc.abstract))
})

xml.on('end', function(){
    console.log(counter.toString())
    indexer.persist("assets/generated/inv/","assets/generated/inx/","Ondrej Sojka", "Abstracts of English Wikipedia articles", "TO BE ADDED LATER; WILL BE GENERATED BY PUTTING THE INV AND INX INTO IPFS", 800)
})

class WikiArticle extends Document{
    getText(){ //for tokenization
        return (this.id + " " + this.text)
    }
}
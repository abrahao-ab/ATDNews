const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const readlineSync = require('readline-sync');



const mongoose = require('mongoose');
const app = express();

const Posts = require('./posts.js');

var login = readlineSync.question('Digite o login: ');
var senha = readlineSync.question('Digite a senha: ');

mongoose.connect(`mongodb+srv://${login}:${senha}@cluster0.rssbawd.mongodb.net/ATDNews?retryWrites=true&w=majority`,{useNewUrlParser: true, useUnifiedTopology: true}).then(()=>
{
    console.log('conectado com sucesso!');
}).catch((err)=>
{
    console.log(err.message);   
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}))


app.engine('html',require('ejs').renderFile);
app.set('view engine','html');
app.use('/public',express.static(path.join(__dirname,'public')));
app.set('views',path.join(__dirname,'/pages'));


//BUSCA
app.get('/',(req,res)=>
{
    console.log(req.query);
    if(req.query.busca == null)
    {
        Posts.find({}).sort({'_id':-1}).exec(function(err,posts){
            
            posts = posts.map((val)=>
            {
                return{
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricao: val.conteudo.substring(0,150)+'...',
                    slug: val.slug,
                    imagem: val.imagem,
                    categoria: val.categoria
                      }
            })            

        Posts.find({}).sort({'views':-1}).limit(3).exec(function(err,postsTop){
            
            postsTop = postsTop.map((val)=>
            {
                return{
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricao: val.conteudo.substring(0,150)+'...',
                    slug: val.slug,
                    imagem: val.imagem,
                    categoria: val.categoria,
                    views: "("+val.views+" views)"
                      }
            })
            
            res.render('home',{posts:posts, postsTop:postsTop});
        })
    })

    }
    else
    {
        Posts.find({titulo: {$regex: req.query.busca,$options:"i"}},(err,posts)=>
        {
            posts = posts.map((val)=>
            {
                return{
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricao: val.conteudo.substring(0,150)+'...',
                    slug: val.slug,
                    imagem: val.imagem,
                    categoria: val.categoria
                      }
            }) 
            res.render('busca',{posts:posts, contagem:posts.length});
        })
    }

}); 

app.get('/:slug',(req,res)=>
{
    //res.send(req.params.slug);
    Posts.findOneAndUpdate({slug: req.params.slug},{$inc: {views : 1}}, {new: true},(err,response)=>
    {
        if(response!= null)
        {
        Posts.find({}).sort({'views':-1}).limit(3).exec(function(err,postsTop){
            
            postsTop = postsTop.map((val)=>
            {
                return{
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricao: val.conteudo.substring(0,150)+'...',
                    slug: val.slug,
                    imagem: val.imagem,
                    categoria: val.categoria,
                    views: "("+val.views+" views)"
                      }
            })
            res.render('single',{noticia:response, postsTop:postsTop});
        
        })

        }
        else
        {
            res.redirect('/');
        }
    })
})


app.listen(5000,()=>
{
    console.log('Server está rodando!');
})

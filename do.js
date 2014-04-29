var cv = document.getElementById('can');
cv.style.cursor='crosshair';
var ctx = cv.getContext('2d');
//console.log(ctx);
var img = new Image();
img.src='test.jpg';


img.style.width = '240px';
img.style.height = '200px';
//document.body.appendChild(img);
ctx.drawImage(img,0,0,240,200);
var imdata=ctx.getImageData(0,0,240,200);
var Filters=[];
var apply=function(filter,im){return imdata;};

/*** components definition here ***/
function copy(im1,im2)
{
    // shalow copy won't solve the prolem,like this:
    //imdata.data=ctx.getImageData(0,0,240,200).data;//[wrong way to copy]

    // deep copy
    var n=im1.data.length;
    for(var i=0;i<n;i++)
    {
        im2.data[i]= im1.data[i];
    }
}

function create()
{
    var im=ctx.createImageData(240,200);
    return im;
}


function grayscale(filter,im)
{
    var nim = create();
    copy(im,nim);
    var n = nim.data.length;
    for(var i=0;i<n;i+=4)
    {
        var r=im.data[i];
        var g=im.data[i+1];
        var b=im.data[i+2];
        var a=im.data[i+3];
        nim.data[i+2]=nim.data[i+1]=nim.data[i]=parseInt(0.3*r+0.59*g+0.11*b);
    }
    return nim;
}

function filterBesides(filter,im)
{
    var nim = create();
    copy(im,nim);
    var n = im.data.length;
    for(var i=0;i<n;i+=4)
    {
        var r=im.data[i];
        var g=im.data[i+1];
        var b=im.data[i+2];
        //var a=im.data[i+3];
        var vr=r-filter.r;
        var vg=g-filter.g;
        var vb=b-filter.b;
        if(vr*vr+vg*vg+vb*vb<filter.t*filter.t)
        {
            nim.data[i+2]=nim.data[i+1]=nim.data[i]=parseInt(0.3*r+0.59*g+0.11*b);
        }
    }
    return nim;
}

function filterExcept(filter,im)
{
    var nim = create();
    copy(im,nim);
    var n = im.data.length;
    for(var i=0;i<n;i+=4)
    {
        var r=im.data[i];
        var g=im.data[i+1];
        var b=im.data[i+2];
        //var a=im.data[i+3];
        var vr=r-filter.r;
        var vg=g-filter.g;
        var vb=b-filter.b;
        if(vr*vr+vg*vg+vb*vb>filter.t*filter.t)
        {
            nim.data[i+2]=nim.data[i+1]=nim.data[i]=parseInt(0.3*r+0.59*g+0.11*b);
        }
    }
    return nim;
}

function stablize(filter,im)
{
    var nim = create();
    copy(im,nim);
    var n = im.data.length;
    for(var i=0;i<n;i+=4)
    {
        var r=im.data[i];
        var g=im.data[i+1];
        var b=im.data[i+2];
        //var a=im.data[i+3];
        var vr=parseInt(r*(r-filter.r)/255)+filter.r;
        var vg=parseInt(g*(g-filter.g)/255)+filter.g;
        
        var vb=parseInt(b*(b-filter.b)/255)+filter.b;
        nim.data[i]=vr;
        nim.data[i+1]=vg;
        nim.data[i+2]=vb;
    }
    return nim;
}

// here to add more effect .....






// save to the memory incaseof repeating actions of query and select
var filterID = document.getElementById('filterID');
function changeFilter()
{
    var index=filterID.value;
    if(index==-1)
    {
        apply=function(filter,im){return im;};
    }
    else
    {
        apply=Filters[index].handler;
        console.log('using '+Filters[index].name);
    }
    //clear background
    ctx.fillStyle='rgb(255,255,255)';
    ctx.fillRect(250,0,240,200);
    // redraw
    var nim = apply(filter,imdata);
    ctx.putImageData(nim,250,0);
}

/*** function definition end ***/

// register filter handler
Filters.push({name:"GrayScale",handler:grayscale});
Filters.push({name:"FilterExcept",handler:filterExcept});
Filters.push({name:"FilterBesides",handler:filterBesides});
Filters.push({name:"Stablize",handler:stablize});

// rgba+threshold
var filter = {r:0,g:0,b:0,a:0,t:60};
cv.addEventListener('mousedown',drawPalette,false);
function drawPalette(e)
{
    var x=e.screenX-10;
    var y=e.screenY-93;
    var i=x*y*4;
    
    var im=ctx.getImageData(x,y,x+1,y+1);
    filter.r=im.data[0];
    filter.g=im.data[1];
    filter.b=im.data[2];
    filter.a=im.data[3];
    console.log(filter);
    //copy this color to fill a rect right side
    ctx.fillStyle="rgba("+filter.r+","+filter.g+","+filter.b+","+filter.a+")";
    ctx.fillRect(550,100,120,30);
    //clear background
    ctx.fillStyle='rgb(255,255,255)';
    ctx.fillRect(250,0,240,200);
    // redraw
    var nim = apply(filter,imdata);
    ctx.putImageData(nim,250,0);
}

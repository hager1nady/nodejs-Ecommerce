

export class ApiFeatures{
    //mongoosequery=product.paginate()
    // query= req.query
    constructor(mongooseQuery,query){
        this.mongooseQuery=mongooseQuery
        this.query=query
    }
    //sort
    sort(){
        // const sort={price:1} 
        // dynamic data for sort
             this.mongooseQuery.sort(this.query.sort)    
            return this;
    }
    // paginate(){}
    pagination(){
        const {page=1,limit=5,skip}=this.query
        const options=    {
            limit,
            skip,
            page,
            }
            // console.log({options});
            
            this.mongooseQuery= this.mongooseQuery.find().skip(skip).limit(limit)
            // console.log({data:this.mongooseQuery});
            
            return this;
    }
    // filters
    filter(){
        const {page=1,limit=10,...filters}=this.query
        const filterStriing=JSON.stringify(filters)
        const replaceFilter= filterStriing.replaceAll(/lt|lte|gt|gte|eq|ne|rejex/g,(ele)=> `$${ele}`)
        const parsedFilter=JSON.parse(replaceFilter)
        console.log({filterStriing,replaceFilter,parsedFilter});
        this.mongooseQuery.find(parsedFilter)
        return this
    }
}
  
    
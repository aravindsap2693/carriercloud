import Env from "./Env";

const CmsService = {
    
    getSlugInfo(slug) {
        const getData = Env.get(`staticpages/${slug}`)
        getData.then(response => {
            let data = response.data.response.cms[0];
            return data;
        }, error => {
            console.error(error)
        })
    }

}

export default CmsService;
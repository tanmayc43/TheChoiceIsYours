const axios = require("axios");
const cheerio = require("cheerio");

// export default function handler(req, res) {
//   res.status(200).json({ message: "API is working!" });
// }

const MAX_PAGES = 100;

export default async function handler(req, res){

  const clientKey = req.headers['x-client-key'];
  if(!clientKey || clientKey !== process.env.MY_SECRET_KEY_HEHE){
    return res.status(401).json({ error: "Forbidden Access." });
  }

  const { username } = req.query;
  if(!username){
    return res.status(400).json({ error: "Username required" });
  }

  try{
    let films = [];
    let page = 1;
    let hasNext = true;

    while(hasNext && page <= MAX_PAGES){
      const url = `https://letterboxd.com/${username}/watchlist/page/${page}/`;
      console.log(`Fetching page ${page} for user ${username}`);
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        },
      });
      //console.log(data.slice(0, 500));
      const $ = cheerio.load(data);
      //console.log($.html('.pagination'));

      //console.log('Number of poster containers:', $(".poster-container").length);
      let filmsOnThisPage = 0;
      $(".poster-container").each((_, el) => {
        const poster = $(el).find(".film-poster").first();
        let img;
        const posterUrl = poster.attr("data-poster-url");
        if (posterUrl && (posterUrl.startsWith("/resized/") || posterUrl.startsWith("/static/"))) {
          img = `https://a.ltrbxd.com${posterUrl}`;
        }
        else{
          img = poster.find("img").attr("src");
        }
        const link = poster.attr("data-target-link");
        const slug = poster.attr("data-film-slug");
        const name = poster.find("img").attr("alt");
        if(img && img.includes('empty-poster')){
          img = 'https://watchlistpicker.com/noimagefound.jpg';
        }
        if(slug && link){
          films.push({
            name,
            slug: `https://letterboxd.com${link}`,
            image: img,
          });
          filmsOnThisPage +=1;
        }
      });

      // stops if no films found on the page (user's watchlist is exhausted)
      if(filmsOnThisPage === 0){
        hasNext = false;
        break;
      }

      // pagination fix: stop if there is NO <a class="next"> in .pagination
      const nextLink = $('.pagination a.next');
      hasNext = nextLink.length > 0;
      page += 1;
    }

    //console.log('Total films found:', films.length);

    if(films.length === 0){
      return res.status(404).json({ error: "No films found in watchlist." });
    }

    // picks a random film
    const randomFilm = films[Math.floor(Math.random() * films.length)];
    return res.status(200).json(randomFilm);
  }
  catch(err){
    console.error("Error fetching watchlist:", err.message);
    return res.status(500).json({ error: "Failed to fetch watchlist." });
  }
}
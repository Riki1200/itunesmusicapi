axios.defaults.baseURL = "https://itunes.apple.com/";


//Por esto le cobrare  solo 40 $USD


// Date Format //

function sortByProperty(property) {
    return function (a, b) {
        if (a[property] < b[property])
            return 1;
        else if (a[property] > b[property])
            return -1;

        return 0;
    }
}


new Vue({
    el: "#app",
    data: {

        search: "",
        albums: [],
        page: 0,
        type: "album",
        imgmusicAlbum: null,
        musicAlbum: null,
        musicArtist: null,
        musicGenre: null,
        musicTraks: [],
        ids: [],
        audio: null,
        active: null,
        activeMusic: false,
        processing: {
            album: false,
            music: false
        },
        searchKey: '',
        currentPage: 100,
        itemsPerPage: 200,
        resultCount: 0,
        dateStart: "",
        dateEnd: "",

    },
    mounted() {
        console.log("component a that's mounted")
        window.addEventListener('scroll', this.scroll)

    },
    destroyed() {
        window.addEventListener('scroll', this.scroll)

    },
    computed: {
        totalPages: function () {
            return Math.ceil(this.resultCount / this.itemsPerPage)
        },
        paginate: function () {
            if (!this.albums || this.albums.length != this.albums.length) {
                return
            }
            this.resultCount = this.albums.length
            if (this.currentPage >= this.totalPages) {
                this.currentPage = this.totalPages
            }
            var index = this.currentPage * this.itemsPerPage - this.itemsPerPage
            return this.albums.slice(index, index + this.itemsPerPage)
        }
    },
    methods: {



        scroll() {
            let observerElement = document.querySelector('.row')
            const callback = (entries) => {
                if (entries[0].isIntersecting) {
                    setTimeout(async () => {
                        this.nextPage();
                    }, 2000)
                }

            }
            const intersectionOb = new IntersectionObserver(callback, {
                threshold: 0.5
            });

            if (observerElement.childNodes.length > 0) {
                intersectionOb.observe(observerElement.lastElementChild);
                //intersectionOb.disconnect()
            }

        },


        setPage: function (pageNumber) {
            this.currentPage = pageNumber
        },

        nextPage() {
            this.page++;
            this.getAlbum();

        },
        sendForm(ev) {
            this.page = 0;
            this.ids = [];
            this.albums = [];

            this.getAlbum();

            this.dateStart = ev.target.startDate.value;
            this.dateEnd = ev.target.endDate.value;



        },
        async getAlbum() {


            this.processing.album = true;
            axios.get(`search?term=${encodeURIComponent(this.search)}&country=MX&media=music&entity=${this.type}&limit=200&offset=${this.page * 200}`)
                .then((resp) => {

                    let albums = resp.data.results.filter(function (album) {
                        return album.trackCount > 4
                    });
                    albums.forEach((v, _k) => {

                        v.artworkUrl100 = v.artworkUrl100.replace("100x100bb", "300x300bb");
                        if (this.ids.indexOf(v.collectionId) < 0) {
                            this.albums.push(v);
                            this.ids.push(v.collectionId);

                        }
                    });



                    this.albums = this.albums.filter(({ releaseDate }) => new Date(releaseDate).getFullYear() > new Date(this.dateStart).getFullYear() && new Date(releaseDate).getFullYear() < new Date(this.dateEnd).getFullYear());








                    this.setPage(1)
                    this.processing.album = false;
                })
                .catch((_error) => {
                    // console.log(error);
                    this.processing.album = false;
                });







        },
        getMusic(dni) {
            this.activeMusic = true;
            this.active = null;
            if (this.audio) {
                this.audio.pause();
                this.audio = null;
            }

            this.processing.music = true;

            axios.get(`https://itunes.apple.com/lookup?id=${dni}&entity=song`)
                .then((resp) => {
                    if (resp.data.resultCount > 0) {
                        this.imgmusicAlbum = resp.data.results[0].artworkUrl100;
                        this.musicAlbum = resp.data.results[0].collectionName;
                        this.musicArtist = resp.data.results[0].artistName;
                        this.musicGenre = resp.data.results[0].primaryGenreName;
                        let i = 0;
                        this.musicTraks = [];
                        resp.data.results.forEach((element, index) => {
                            if (index > 0) {
                                this.musicTraks[i] = element;
                                i++;
                            }
                        });


                        // this.musicTraks = this.musicTraks.sort(sortByProperty('releaseDate'));

                        this.processing.music = false;

                    }
                })
                .catch((err) => {
                    this.processing.music = false;
                    // console.log(err)
                });
        },
        play(audio) {
            if (this.audio) {
                this.audio.pause();
            }
            this.audio = new Audio(audio);
            this.audio.play();
        },
    },

});

(
    () => {
      const apiKey = 'e5c91c7259ce432a873c620efcb3eb83';
      const defaultSource = 'blasting-news-br';
      const sourceSelector = document.querySelector('#sources');
      const newsArticles = document.querySelector('#cards');
      const btnInstall = document.querySelector('#add');
      const shareBtn = document.querySelectorAll('.share');
      let deferredPrompt;

      const requestNotificationPermission = async () => {
        const permission = await window.Notification.requestPermission()
        // value of permission can be 'granted', 'default', 'denied'
        // granted: user has accepted the request
        // default: user has dismissed the notification permission popup by clicking on x
        // denied: user has denied the request.
        if (permission !== 'granted') {
          console.log('Permission not granted for Notification');
        } else {
          console.log('Permission granted for Notification');
        }
      }
  
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () =>
          navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('Service Worker registered'))
            .catch(err => 'SW registration failed'));
      }

      if ('PushManager' in window) {
        console.log('SerPushManager OK');
        requestNotificationPermission();

      } else {
        throw new Error('No Push API Support!');
      }
  
      window.addEventListener('load', e => {
        sourceSelector.addEventListener('change', evt => updateNews(evt.target.value));
        updateNewsSources().then(() => {
          sourceSelector.value = defaultSource;
          updateNews();
        });
      });
  
      window.addEventListener('online', () => updateNews(sourceSelector.value));
  
      async function updateNewsSources() {
        const response = await fetch(`https://newsapi.org/v2/sources?apiKey=${apiKey}&country=br`);
        const json = await response.json();
        sourceSelector.innerHTML =
          json.sources.map(createSource).join('\n');
      }
  
      async function updateNews(source = defaultSource) {
        newsArticles.innerHTML = '';
        const response = await fetch(`https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&sources=${source}&sortBy=top`);
        const json = await response.json();
        console.log(json);
        newsArticles.innerHTML =
          json.articles.map(createArticle).join('\n');
      }
  
      function createArticle(article) {
        return `
        <div class="column is-one-quarter-tablet is-one-quarter-desktop is-full-mobile">
          <div class="card">
            <div class="card-image">
              <figure class="image is-4by3">
                <img src="${article.urlToImage}" alt="${article.title}">
              </figure>
            </div>
            <div class="card-content">
              <div class="content">
                <p class="title is-4">${article.title}</p>
                <p class="subtitle is-6">${article.title}</p>
              </div>
              <div class="content">
                ${article.description}
                <br>
                <time datetime="2016-1-1">${article.publishedAt}</time>
              </div>
            </div>
            <footer class="card-footer">
              <!--p onClick="shareNews()" class="card-footer-item share">Share 1</p-->
              <!--p class="card-footer-item share" >Share 2</p-->
            </footer>
          </div>
        </div>`;
      }

      function createSource(source) {
        return `
            <a href="#" class="navbar-item" data-id="${source.id}">
              ${source.name}
            </a>
        `;
      }

      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI notify the user they can install the PWA
        btnInstall.style.display = 'block';
      });

      btnInstall.addEventListener('click', (e) => {
        // Hide the app provided install promotion
        btnInstall.style.display = 'none';
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          } else {
            console.log('User dismissed the install prompt');
          }
        });
      });


      window.addEventListener('appinstalled', (evt) => {
        // Log install to analytics
        console.log('INSTALL: Success');
      });


      /*
      if (navigator.share) {
        navigator.share({
          title: 'web.dev',
          text: 'Check out web.dev.',
          url: 'https://web.dev/',
        })
          .then(() => console.log('Successful share'))
          .catch((error) => console.log('Error sharing', error));
      }
      */

    }
  )();
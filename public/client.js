// --- DOM Elements ---

// Views
const viewHome = document.getElementById('view-home');
const viewPost = document.getElementById('view-post');

// Containers
const blogList = document.getElementById('blog-list');
const fullPostContent = document.getElementById('full-post-content');

// Buttons
const btnHome = document.getElementById('btn-home');
const btnBack = document.getElementById('back-btn');

// --- Feedback Helper ---
const FEEDBACK_CLASSES = ['feedback-loading', 'feedback-success', 'feedback-warning', 'feedback-error'];

function setFeedback(message, state) {
    feedbackMessage.textContent = message;
    feedbackMessage.classList.remove(...FEEDBACK_CLASSES);
    if (state) {
        feedbackMessage.classList.add(`feedback-${state}`);
    }
}


// --- Navigation Functions ---

function goHome() {
    viewHome.style.display = 'block';
    viewPost.style.display = 'none';
}

function goToPost() {
    viewHome.style.display = 'none';
    viewPost.style.display = 'block';
}

// --- Event Listeners ---

btnHome.addEventListener('click', () => {
    goHome();
});

btnBack.addEventListener('click', () => {
    goHome();
});

// --- Load Latest Blog Post ---
async function loadLatestPost() {
    try {
        const response = await fetch('/api/posts/latest');
        if (!response.ok) return;

        const post = await response.json();
        const date = new Date(post.date).toLocaleDateString('da-DK', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // Extract first <p> text as excerpt
        const excerptMatch = post.content.match(/<p>(.*?)<\/p>/);
        const excerpt = excerptMatch
            ? excerptMatch[1].replace(/<[^>]*>/g, '').slice(0, 120) + '...'
            : '';

        // Render blog card in home view (DOM API to avoid innerHTML XSS)
        blogList.textContent = '';
        const article = document.createElement('article');
        article.className = 'blog-card';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const tag = document.createElement('span');
        tag.className = 'card-tag';
        tag.textContent = 'Ny';

        const cardTitle = document.createElement('h2');
        cardTitle.className = 'card-title';
        cardTitle.textContent = post.title;

        const cardExcerpt = document.createElement('p');
        cardExcerpt.className = 'card-excerpt';
        cardExcerpt.textContent = excerpt;

        cardBody.append(tag, cardTitle, cardExcerpt);

        const cardFooter = document.createElement('div');
        cardFooter.className = 'card-footer';

        const btnReadMore = document.createElement('button');
        btnReadMore.className = 'read-more-btn';
        btnReadMore.textContent = 'Læs mere \u2192';
        btnReadMore.addEventListener('click', () => goToPost());

        cardFooter.appendChild(btnReadMore);
        article.append(cardBody, cardFooter);
        blogList.appendChild(article);

        // Render full post in post view (title/date via DOM, content is trusted server HTML)
        fullPostContent.textContent = '';

        const postTitle = document.createElement('h2');
        postTitle.textContent = post.title;

        const postDate = document.createElement('time');
        postDate.className = 'post-date';
        postDate.textContent = date;

        const postBody = document.createElement('div');
        postBody.innerHTML = post.content;

        fullPostContent.append(postTitle, postDate, postBody);
    } catch (err) {
        console.error('Error loading latest post:', err);
    }
}

loadLatestPost();

// --- Helper Function: Find URL'er (Regex) ---
function extractUrls(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.match(urlPattern) || [];
}

// --- Form Handling ---

const commentForm = document.getElementById('comment-form');
const feedbackMessage = document.getElementById('feedback-message');

// --- Comment Rendering ---
const commentsList = document.getElementById('comments-list');

function renderComment(comment) {
    const div = document.createElement('div');
    div.className = 'comment-card';

    const header = document.createElement('div');
    header.className = 'comment-header';

    const strong = document.createElement('strong');
    strong.textContent = comment.author;

    const time = document.createElement('time');
    time.textContent = new Date(comment.date).toLocaleString('da-DK');

    header.append(strong, time);

    const p = document.createElement('p');
    p.textContent = comment.text;

    div.append(header, p);
    return div;
}

if (commentForm) {
    commentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const author = document.getElementById('comment-author').value;
        const text = document.getElementById('comment-text').value;
        const email = document.getElementById('comment-email').value;
        const subscribe = document.getElementById('comment-subscribe').checked;

        setFeedback("Publicerer din kommentar...", "loading");

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author, text, email, subscribe })
            });

            const data = await response.json();

            if (!response.ok) {
                setFeedback(data.error || "Noget gik galt. Prøv igen.", "error");
                return;
            }

            setFeedback("Din kommentar er publiceret!", "success");
            commentsList.prepend(renderComment(data));
            commentForm.reset();
        } catch (error) {
            setFeedback("Fejl: Kunne ikke kontakte serveren. Prøv igen senere.", "error");
            console.error("Comment post error:", error);
        }
    });
}
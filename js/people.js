document.querySelector('[data-section="people"]').addEventListener('click', function () {
    const peopleSection = document.getElementById('people-section');
    const container = document.getElementById('people-cards-container');


    // Fetch data from API
    fetch('https://jsonplaceholder.typicode.com/users')
        .then(response => response.json())
        .then(users => {
            container.innerHTML = '';

            users.forEach(user => {
                const card = createPeopleCard(user);
                container.appendChild(card);
            });

            document.getElementById('search-people').addEventListener('input', function (e) {
                const searchTerm = e.target.value.toLowerCase();
                const cards = container.getElementsByClassName('col-md-6');

                Array.from(cards).forEach(card => {
                    const name = card.querySelector('.card-title').textContent.toLowerCase();
                    const email = card.querySelector('.card-text:nth-child(2)').textContent.toLowerCase();
                    const company = card.querySelector('.card-text:nth-child(4)').textContent.toLowerCase();

                    if (name.includes(searchTerm) || email.includes(searchTerm) || company.includes(searchTerm)) {
                        card.classList.remove('d-none');
                    } else {
                        card.classList.add('d-none');
                    }
                });
            });

            document.getElementById('sort-people').addEventListener('click', function () {
                const cards = Array.from(container.getElementsByClassName('col-md-6'));

                cards.sort((a, b) => {
                    const nameA = a.querySelector('.card-title').textContent;
                    const nameB = b.querySelector('.card-title').textContent;
                    return nameA.localeCompare(nameB);
                });

                if (this.dataset.sorted === 'asc') {
                    cards.reverse();
                    this.dataset.sorted = 'desc';
                    this.innerHTML = '<i class="bi bi-sort-alpha-down-alt"></i> Sort';
                } else {
                    this.dataset.sorted = 'asc';
                    this.innerHTML = '<i class="bi bi-sort-alpha-down"></i> Sort';
                }

                cards.forEach(card => container.appendChild(card));
            });
        })
        .catch(error => {
            container.innerHTML = `
        <div class="col-12 text-center">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">Error loading data</h4>
            <p>Failed to fetch people data. Please try again later.</p>
            <hr>
            <p class="mb-0">${error.message}</p>
          </div>
        </div>
      `;
        });

    function createPeopleCard(user) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';

        const initials = user.name.split(' ').map(n => n[0]).join('');

        const colors = ['#6c5ce7', '#00b894', '#fd79a8', '#e17055', '#0984e3', '#d63031', '#fdcb6e'];
        const colorIndex = user.name.length % colors.length;

        col.innerHTML = `
      <div class="card people-card h-100">
        <div class="card-img-top d-flex align-items-center justify-content-center">
           <div class="initials-avatar" style="background-color: ${colors[colorIndex]}; color: white;">
            ${initials}
           </div>
        </div>
        <div class="card-body">
           <h5 class="card-title">${user.name}</h5>
           <p class="card-text">${user.email}</p>
           <p class="card-text">${user.phone}</p>
           <p class="card-text">${user.company.name}</p>
        </div>
        <div class="card-footer">
           <small>${user.address.city}</small>
        </div>
      </div>
    `;

        return col;
    }
});
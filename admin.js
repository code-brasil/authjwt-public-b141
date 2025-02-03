let isEditing = false;

document.getElementById('refreshUsers').addEventListener('click', fetchUsers);
document.getElementById('addUserBtn').addEventListener('click', () => openModal());
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('userForm').addEventListener('submit', handleUserForm);
document.getElementById('adminLogout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

fetchUsers();

async function fetchUsers() {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8000/functions/authjwt/get_users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });
    const data = await response.json();
    if (data.users) {
        const table = document.getElementById('usersTable');
        table.innerHTML = '';
        data.users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="py-2 px-4 border-b text-center">${user.id}</td>
                <td class="py-2 px-4 border-b text-center">${user.username}</td>
                <td class="py-2 px-4 border-b text-center">${user.is_admin ? 'Sim' : 'Não'}</td>
                <td class="py-2 px-4 border-b text-center">${new Date(user.last_online).toLocaleString()}</td>
                <td class="py-2 px-4 border-b text-center">
                    <button onclick="editUser(${user.id})" class="bg-yellow-500 text-white px-2 py-1 rounded mr-2">Editar</button>
                    <button onclick="deleteUser(${user.id})" class="bg-red-500 text-white px-2 py-1 rounded">Excluir</button>
                </td>
            `;
            table.appendChild(tr);
        });
    } else {
        alert(data.message || 'Erro ao buscar usuários');
    }
}

function openModal(user = null) {
    isEditing = !!user;
    document.getElementById('modalTitle').innerText = isEditing ? 'Editar Usuário' : 'Adicionar Usuário';
    if (user) {
        document.getElementById('userName').value = user.username;
        document.getElementById('userPassword').value = '';
        document.getElementById('isAdmin').value = user.is_admin;
        document.getElementById('userId').value = user.id;
    } else {
        document.getElementById('userForm').reset();
        document.getElementById('userId').value = '';
    }
    document.getElementById('userModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('userModal').classList.add('hidden');
    document.getElementById('modalError').innerText = '';
}

async function handleUserForm(e) {
    e.preventDefault();
    const username = e.target.userName.value;
    const password = e.target.userPassword.value;
    const is_admin = e.target.isAdmin.value === 'true';
    const id = e.target.userId.value;
    const token = localStorage.getItem('token');
    let endpoint = 'add_user';
    let body = { username, password, is_admin, token };
    if (isEditing) {
        endpoint = 'edit_user';
        body.id = id;
    }
    const response = await fetch(`http://localhost:8000/functions/authjwt/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    if (data.success) {
        fetchUsers();
        closeModal();
    } else {
        document.getElementById('modalError').innerText = data.message || 'Erro ao processar';
    }
}

async function deleteUser(id) {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8000/functions/authjwt/delete_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, token })
    });
    const data = await response.json();
    if (data.success) {
        fetchUsers();
    } else {
        alert(data.message || 'Erro ao deletar usuário');
    }
}

async function editUser(id) {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8000/functions/authjwt/get_users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });
    const data = await response.json();
    if (data.users) {
        const user = data.users.find(u => u.id === id);
        if (user) {
            openModal(user);
        } else {
            alert('Usuário não encontrado');
        }
    } else {
        alert(data.message || 'Erro ao buscar usuários');
    }
}
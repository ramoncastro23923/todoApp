let currentUser = null;
const form = document.getElementById('input_form');
const formCreateUser = document.getElementById('form_create_user');
const btnCriar = document.getElementById('create_user');
const btnSair = document.getElementById('sair');
const formTarefa = document.querySelector('.form_tarefa');
const btnCriarTarefa = document.getElementById('btn_criar_tarefa');

const firebaseConfig = {
    apiKey: "AIzaSyBBOVOQ2L83WfcSJywkuzebHHCDW7VuYjg",
    authDomain: "todoapp-7dc9f.firebaseapp.com",
    projectId: "todoapp-7dc9f",
    storageBucket: "todoapp-7dc9f.appspot.com",
    messagingSenderId: "719887311135",
    appId: "1:719887311135:web:c5db76b8a603316753902a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Sair
function sair() {
    firebase.auth().signOut()
        .then(() => {
            currentUser = null;
            document.querySelector('.container-login').style.display = "none";
            formCreateUser.style.display = "none";
            form.style.display = "block";
            console.log('Deslogado com sucesso');
        })
        .catch((error) => {
            console.error('Erro ao sair', error);
        });
}

// Login
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            form.style.display = "none";
            document.querySelector('.container-login').style.display = "block";
            form.reset();
            console.log("Logado:", currentUser.email);
        })
        .catch((error) => {
            console.error("Erro de autenticação:", error);
        });

    formTarefa.reset();
});

// Verificador de autenticação
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        form.style.display = "none";
        document.querySelector('.container-login').style.display = "block";
        console.log("Logado verificador:", user.uid);

        // Ouvir mudanças no banco de dados
        db.collection('tarefas').where("userId", "==", user.uid).onSnapshot((snapshot) => {
            const list = document.getElementById('tarefas');
            list.innerHTML = '';
            const tarefas = snapshot.docs.sort((a, b) => a.data().horario < b.data().horario ? -1 : 1);

            tarefas.forEach((doc) => {
                const tarefa = doc.data();
                list.innerHTML += `<li>${tarefa.tarefa} - <a tarefa-id="${doc.id}" href="javascript:void(0)" class="excluir-btn">X Excluir</a></li>`;
            });

            // Excluir tarefa
            document.querySelectorAll('.excluir-btn').forEach((element) => {
                element.addEventListener("click", (e) => {
                    e.preventDefault();
                    const docId = element.getAttribute('tarefa-id');
                    db.collection('tarefas').doc(docId).delete();
                });
            });
        });
    } else {
        console.log("Deslogado verificador");
    }
});

// Criar usuário
function criar() {
    form.style.display = "none";
    formCreateUser.style.display = "block";

    formCreateUser.addEventListener("submit", (e) => {
        e.preventDefault();
        const createName = document.getElementById('nome').value;
        const createEmail = document.getElementById('create_email').value;
        const createPassword = document.getElementById('create_password').value;

        firebase.auth().createUserWithEmailAndPassword(createEmail, createPassword)
            .then((userCredential) => {
                const user = userCredential.user;
                user.updateProfile({ displayName: createName }).then(() => {
                    console.log('Login criado com sucesso!', user);
                    form.style.display = "block";
                    formCreateUser.style.display = "none";
                    sair();
                });
            })
            .catch((error) => {
                console.error('Erro ao criar usuário:', error);
            });
    });
}

// Adicionar tarefa
formTarefa.addEventListener("submit", (e) => {
    e.preventDefault();
    const tarefa = document.getElementById("tarefa").value;
    const dateHora = document.getElementById('dia_hora').value;
    const dataAtual = new Date().getTime();

    if (dataAtual > new Date(dateHora).getTime()) {
        console.log('A data é menor que a data atual');
    } else if (tarefa === "" || dateHora === "") {
        alert("Você precisa preencher os campos vazios!!");
    } else {
        db.collection('tarefas').add({
            tarefa: tarefa,
            horario: dateHora,
            userId: currentUser.uid,
            user: currentUser.displayName
        });
        console.log('Tarefa criada com sucesso', currentUser);
        formTarefa.reset();
    }
});

btnSair.addEventListener('click', sair);
btnCriar.addEventListener('click', criar);

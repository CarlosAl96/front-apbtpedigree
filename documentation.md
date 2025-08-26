# Documentación Detallada de Módulos y Componentes

Este documento proporciona una descripción exhaustiva de cada módulo de la aplicación, sus componentes y la lógica subyacente. El objetivo es ofrecer una guía clara para el mantenimiento y desarrollo futuro del proyecto.

---

## 1. Módulo `account`

Este módulo se encarga de la gestión de la cuenta del usuario autenticado.

### Componentes

#### `account/account.component`
- **Descripción:** Es la página principal de la cuenta de usuario. Permite al usuario ver y actualizar su información personal, como nombre de usuario, correo electrónico y contraseña. También puede mostrar información relevante sobre el estado de su cuenta, como la fecha de registro o el tipo de suscripción.
- **Aspectos de Código:**
    - Utiliza `ReactiveFormsModule` para construir y validar los formularios de edición de perfil.
    - Se comunica con `AuthService` para enviar las actualizaciones de la información del usuario al backend.
    - Muestra notificaciones (`ToastService`) para informar al usuario sobre el éxito o fracaso de las operaciones.

### Enrutamiento

#### `account.routes.ts`
- **Descripción:** Define la ruta `/account` que carga el `AccountComponent`. Es una ruta protegida que requiere que el usuario esté autenticado.

---

## 2. Módulo `forum`

Este módulo implementa toda la funcionalidad del foro de la comunidad, permitiendo a los usuarios crear temas, publicar mensajes y interactuar.

### Componentes

#### `forum/forum.component`
- **Descripción:** Es la página principal del foro. Generalmente, muestra una lista de categorías o los temas más recientes y activos. Actúa como punto de entrada para que los usuarios naveguen por el contenido del foro.

#### `topics-list/topics-list.component`
- **Descripción:** Muestra una lista de temas (hilos de discusión) dentro de una categoría específica del foro. Permite la paginación y el ordenamiento por fecha o actividad. Cada elemento de la lista enlaza a la vista de `posts-list`.
- **Aspectos de Código:**
    - Realiza una llamada a un servicio (`ForumService`) para obtener los temas, pasando parámetros de paginación y filtrado.

#### `posts-list/posts-list.component`
- **Descripción:** Muestra la secuencia de mensajes (posts) dentro de un tema específico. Aquí es donde los usuarios leen la discusión y pueden añadir sus propias respuestas.
- **Aspectos de Código:**
    - Implementa scroll infinito o paginación para cargar los mensajes.
    - Incluye el componente `new-post` para que los usuarios puedan responder al tema.

#### `profile/profile.component`
- **Descripción:** Muestra el perfil público de un usuario dentro del contexto del foro. Puede incluir información como el número de mensajes, la fecha de registro, y una lista de sus temas o publicaciones recientes.

#### `components/new-topic/new-topic.component`
- **Descripción:** Un componente (a menudo un popup o `Dialog`) que contiene un formulario para que los usuarios creen un nuevo tema en una categoría del foro.
- **Aspectos de Código:**
    - Utiliza un formulario reactivo con validadores para el título y el contenido del primer mensaje.
    - Al enviar, llama al `ForumService` para crear el nuevo tema y luego redirige al usuario al nuevo hilo.

#### `components/new-post/new-post.component`
- **Descripción:** Un componente con un editor de texto que permite a los usuarios escribir y enviar una respuesta a un tema existente.
- **Aspectos de Código:**
    - El formulario se reinicia después de un envío exitoso.
    - La lista de posts (`posts-list`) se actualiza automáticamente para mostrar el nuevo mensaje.

### Enrutamiento

#### `forum.routes.ts`
- **Descripción:** Define las rutas anidadas del foro, como `/forum` (para la lista de categorías), `/forum/:categoryId` (para `topics-list`), y `/forum/topic/:topicId` (para `posts-list`).

---

## 3. Módulo `home`

Es el módulo de la página de inicio, la primera vista que el usuario ve después de iniciar sesión.

### Componentes

#### `home-page/home-page.component`
- **Descripción:** Actúa como el panel principal o landing page de la aplicación. Su responsabilidad más importante es verificar el estado del pago del usuario para acceder a contenido premium (como el streaming).
- **Aspectos de Código:**
    - En el hook `ngOnInit`, invoca de forma asíncrona al método `verifyPayment`.
    - `verifyPayment` se comunica con `PaymentService` para comprobar si el usuario tiene un pago válido o es administrador.
    - Si la verificación falla (el usuario no ha pagado y hay un stream activo), utiliza `DialogService` de PrimeNG para abrir el `StreamPayPopupComponent`, solicitando el pago.

### Enrutamiento

#### `home.routes.ts`
- **Descripción:** Define la ruta `/home` que carga el `HomePageComponent`.

---

## 4. Módulo `messages`

Implementa un sistema de mensajería privada entre usuarios.

### Componentes

#### `messages/messages.component`
- **Descripción:** Es el componente contenedor principal de la interfaz de mensajería. Típicamente, presenta un diseño de dos paneles: una lista de conversaciones a la izquierda y la ventana de chat activa a la derecha.

#### `chats-list/chats-list.component`
- **Descripción:** Muestra la lista de todas las conversaciones del usuario. Cada elemento representa un chat con otro usuario y puede mostrar el último mensaje y la hora. Al hacer clic en un elemento, se carga la conversación en el componente `messages-list`.

#### `messages-list/messages-list.component`
- **Descripción:** Muestra los mensajes de una conversación seleccionada.
- **Aspectos de Código:**
    - Utiliza un servicio de socket (`SocketService`) para recibir y mostrar mensajes en tiempo real.
    - La alineación de los mensajes (izquierda/derecha) se determina comparando el `user_id` del mensaje con el del usuario actual.
    - Implementa una función `scrollToBottom` para mantener visible el mensaje más reciente.

### Enrutamiento

#### `messages.routes.ts`
- **Descripción:** Configura las rutas para la sección de mensajería, permitiendo opcionalmente cargar una conversación específica a través de la URL (ej. `/messages/:chatId`).

---

## 5. Módulo `pedigree`

Módulo central y complejo para la gestión de pedigríes de perros.

### Componentes

#### `pedigrees/pedigrees.component`
- **Descripción:** Muestra una lista pública de todos los pedigríes a los que el usuario tiene acceso. Permite buscar y filtrar.

#### `my-pedigrees/my-pedigrees.component`
- **Descripción:** Una vista personalizada que muestra solo los pedigríes que pertenecen al usuario autenticado. Ofrece acceso a acciones de gestión como editar, eliminar o transferir.

#### `components/pedigree-view/pedigree-view.component`
- **Descripción:** Componente clave que renderiza la estructura de árbol genealógico de un pedigrí. Visualiza los ancestros de un perro a través de varias generaciones.
- **Aspectos de Código:**
    - La lógica de renderizado puede ser compleja, utilizando a menudo tablas anidadas o CSS (flexbox/grid) para crear la estructura de árbol.
    - Es un componente de solo lectura, centrado en la visualización de datos.

#### `components/new-pedigree/new-pedigree.component`
- **Descripción:** Un formulario complejo para registrar un nuevo perro y su pedigrí. El usuario puede introducir información sobre el perro y sus padres, abuelos, etc.

#### `components/delete-pedigree/delete-pedigree.component`
- **Descripción:** Un diálogo de confirmación para eliminar un pedigrí de forma segura.

#### `components/transfer-ownership/transfer-ownership.component`
- **Descripción:** Permite al propietario actual de un pedigrí transferirlo a otro usuario del sistema, buscando al nuevo propietario por su nombre de usuario o correo.

#### `components/upload-picture/upload-picture.component`
- **Descripción:** Gestiona la subida de imágenes para un perro específico en el pedigrí.

#### `components/change-permissions/change-permissions.component`
- **Descripción:** Permite al propietario de un pedigrí gestionar los permisos de acceso (ej. hacerlo público, privado o compartirlo con usuarios específicos).

#### `components/public-link/public-link.component`
- **Descripción:** Genera un enlace único y compartible para que personas sin una cuenta puedan ver un pedigrí específico.

#### `components/public-pedigree-view/public-pedigree-view.component`
- **Descripción:** La vista que se muestra al acceder a un enlace público. Es similar a `pedigree-view` pero sin opciones de gestión.

### Enrutamiento

#### `pedigree.routes.ts`
- **Descripción:** Define rutas para ver, crear y gestionar pedigríes.

---

## 6. Módulo `stream`

Contiene la funcionalidad principal para visualizar transmisiones en vivo.

### Componentes

#### `stream/stream.component`
- **Descripción:** Es el componente principal que alberga el reproductor de video de la transmisión. Se encarga de cargar y mostrar el stream de video (ej. HLS, Dash) y de integrar otros componentes relacionados, como el chat.

#### `chat/chat.component`
- **Descripción:** Este es el componente de chat que se muestra junto al video durante una transmisión. Es una versión integrada del chat en la página de stream.
- **Nota:** Existe un módulo `stream-chat` separado. Este componente (`stream/chat`) podría ser una versión más simple o un contenedor que envuelve la lógica del módulo `stream-chat`.

### Enrutamiento

#### `stream.routes.ts`
- **Descripción:** Define la ruta `/stream` que carga el `StreamComponent`. El acceso a esta ruta está probablemente protegido por el estado de pago del usuario.

---

## 7. Módulo `stream-chat`

Módulo dedicado exclusivamente a la funcionalidad de chat para las transmisiones, diseñado para ser robusto y con funciones de moderación.

### Componentes

#### `stream-chat-page/stream-chat.component`
- **Descripción:** Es el corazón del chat en vivo. Gestiona la conexión por socket para recibir y enviar mensajes en tiempo real.
- **Aspectos de Código:**
    - **Comunicación por Sockets:** Utiliza `SocketService` para escuchar eventos como `onStreamMessage` (nuevo mensaje), `onStreamChatBan` (un usuario es baneado) y `onStreamMessageDeleted` (un mensaje es eliminado por un moderador).
    - **Alineación de Mensajes:** La clase CSS `right-align` o `left-align` se aplica dinámicamente comparando `message.user_id` con el `user.id` del usuario actual. Esto asegura que los mensajes propios aparezcan a la derecha.
    - **Prevención de Duplicados:** Se implementó lógica para evitar que los mensajes enviados por el propio usuario aparezcan dos veces. El mensaje se añade localmente para una respuesta instantánea, y se implementa una comprobación en el receptor del socket para no añadirlo de nuevo si ya existe.
    - **Funciones de Moderación:** Incluye métodos para que los administradores (`user.is_superuser`) puedan eliminar mensajes (`deleteMessage`) o banear usuarios del chat (`banUserChat`). Estas acciones emiten eventos de socket para notificar a todos los clientes.
    - **Interfaz de Usuario:** Utiliza componentes de PrimeNG como `InputGroup`, `Button` y `ConfirmDialog` para la interfaz y las confirmaciones de acciones de moderación. También integra un selector de emojis (`@ctrl/ngx-emoji-mart`).

### Enrutamiento

#### `stream-chat.routes.ts`
- **Descripción:** Define la ruta para acceder a la página de chat, aunque lo más común es que este componente se integre dentro de otra vista (como `StreamComponent`) en lugar de ser una página independiente.

---

## 8. Módulo `auth`

Este módulo agrupa todas las funcionalidades relacionadas con la autenticación de usuarios. Es el punto de entrada a la aplicación para usuarios nuevos y recurrentes.

### Componentes

#### `login/login.component`
- **Descripción:** Proporciona el formulario para que los usuarios existentes inicien sesión. Maneja la validación de credenciales y la gestión de sesiones.
- **Aspectos de Código:**
    - Utiliza un `FormGroup` de `ReactiveFormsModule` para gestionar los campos de usuario y contraseña.
    - Llama al método `authService.login()` y, en caso de éxito, guarda el token de sesión usando `SessionService`.
    - Emite un evento de socket (`socketService.emitLogin()`) para notificar a otros sistemas del inicio de sesión.
    - Redirige al usuario a la página `/home` tras un inicio de sesión exitoso.

#### `register/register.component`
- **Descripción:** Ofrece un formulario para que nuevos usuarios se registren en la plataforma.
- **Aspectos de Código:**
    - Valida que los campos (nombre de usuario, email, contraseña) sean correctos y que las contraseñas coincidan.
    - Llama a `authService.register()` para crear la nueva cuenta.

#### `forgot-password/forgot-password.component`
- **Descripción:** Un formulario simple donde el usuario puede introducir su dirección de correo electrónico para solicitar un enlace de restablecimiento de contraseña.

#### `new-password/new-password.component`
- **Descripción:** La página a la que llega el usuario tras hacer clic en el enlace de restablecimiento. Permite al usuario establecer una nueva contraseña, validando el token recibido por la URL.

### Enrutamiento

#### `auth.routes.ts`
- **Descripción:** Define las rutas públicas para la autenticación, como `/login`, `/register`, `/forgot-password` y `/new-password/:token`. Estas rutas son accesibles para usuarios no autenticados.

---

## 9. Módulo `admin`

Este es un módulo de acceso restringido que contiene todas las herramientas para la administración de la plataforma. El acceso está protegido por un `Guard` que verifica si el usuario tiene el rol de administrador (`is_superuser`).

### Componentes

#### `dashboard/dashboard.component`
- **Descripción:** Es la página de inicio del panel de administración. Suele mostrar estadísticas clave (KPIs) como número de usuarios registrados, pagos recientes, actividad del foro, etc.

#### `users/users.component`
- **Descripción:** Permite a los administradores ver una lista de todos los usuarios registrados. Ofrece funcionalidades para buscar, filtrar y gestionar usuarios individualmente.
- **Subcomponentes:**
    - `new-user`: Un formulario para crear un nuevo usuario manualmente.
- **Aspectos de Código:**
    - Las acciones de gestión (como banear o cambiar rol) se realizan a través de `AdminService`.

#### `streams/streams.component`
- **Descripción:** Panel para gestionar las transmisiones en vivo. Los administradores pueden crear nuevas transmisiones, programarlas, ver el estado de las actuales y consultar el historial.
- **Subcomponentes:**
    - `new-stream`: Formulario para configurar y programar una nueva transmisión.

#### `payments/payments.component`
- **Descripción:** Muestra una tabla con el historial de todos los pagos realizados en la plataforma. Permite a los administradores verificar transacciones, buscar pagos específicos y ver detalles.

#### `forum/forum.component` (Admin)
- **Descripción:** Proporciona herramientas de moderación y gestión para el foro.
- **Subcomponentes:**
    - `new-category`: Formulario para crear nuevas categorías en el foro.
- **Aspectos de Código:**
    - Permite a los administradores editar o eliminar categorías, temas o publicaciones que infrinjan las normas.

### Enrutamiento

#### `admin.routes.ts`
- **Descripción:** Define las rutas anidadas para el panel de administración, como `/admin/dashboard`, `/admin/users`, `/admin/streams`, etc. Todas estas rutas están protegidas y solo son accesibles para administradores.

<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Language" content="en">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Control de Ventas | Granja San Antonio</title>
    <meta name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no" />

    <!-- Disable tap highlight on IE -->
    <meta name="msapplication-tap-highlight" content="no">

    <link rel="stylesheet" href="{{ asset('assets/css/base.css') }}">

</head>

<body>
    <div class="app-container app-theme-white body-tabs-shadow">
        <div class="app-container">
            <div class="h-100">
                <div class="h-100 no-gutters row">
                    <div class="d-none d-lg-block col-lg-4">
                        <div class="slider-light">
                            <div class="slick-slider">
                               
                                <div>
                                    <div class="position-relative h-100 d-flex justify-content-center align-items-center bg-premium-dark"
                                        tabindex="-1">
                                        <div class="slide-img-bg"
                                            style="background-image: url('../assets/images/originals/citynights.jpg');">
                                        </div>
                                        <div class="slider-content">
                                            <h3>Granja San Antonio</h3>
                                            <p>Control de Ventas</p>
                                        </div>
                                    </div>
                                </div>
                                 
                            </div>
                        </div>
                    </div>
                    <div class="h-100 d-flex bg-white justify-content-center align-items-center col-md-12 col-lg-8">
                        <div class="mx-auto app-login-box col-sm-12 col-md-10 col-lg-9">
                            <div class="app-logo"></div>
                            <h4 class="mb-0">
                                <span class="d-block">Bienvenido</span>
                                <span>Ingrese sus credenciales</span>
                            </h4>
                            
                            <div class="divider row"></div>
                            <div>
                                <form class="" id="loginForm" method="POST" action="{{ route('authenticate') }}">
                                    <input type="hidden" name="_token" id="token" value="{{ csrf_token() }}" />
                                    <div class="form-row">
                                        <div class="col-md-6">
                                            <div class="position-relative form-group"><label for="exampleEmail"
                                                    class="">Usuario</label><input name="username" id="username"
                                                    placeholder="Ingrese su usuario..." type="text" class="form-control"></div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="position-relative form-group"><label for="examplePassword"
                                                    class="">Clave</label><input name="password" id="password"
                                                    placeholder="Ingrese su clave..." type="password" class="form-control">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="position-relative form-check"><input name="check" id="exampleCheck"
                                            type="checkbox" class="form-check-input"><label for="exampleCheck"
                                            class="form-check-label">Mantenerme conectado</label></div>
                                    <div class="divider row"></div>
                                    <div class="d-flex align-items-center">
                                        <div class="ml-auto">
                                            <button class="btn btn-primary btn-lg">Ingresar</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <!--SCRIPTS INCLUDES-->

    <!--CORE-->
    <script src="https://code.jquery.com/jquery-3.3.1.min.js"
        integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.bundle.min.js"
        crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/metismenu"></script>

 


    <!--SweetAlert2-->
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script> 

    <script src="{{ asset('assets/js/loadingObject.js') }}"></script>
    <script src="{{ asset('assets/js/handleResponse.js') }}"></script>


     <script>
        const headers = {
          "Content-Type": "application/json",
          "Accept": "application/json, text-plain, */*",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": $("#token").val(),
        };

        $("#loginForm").on('submit', function (event) {
            event.preventDefault();
            console.log('test');
            const urlReset = $("#loginForm").attr('action');
          const params = {
            'username': $("#username").val(),
            'password': $("#password").val(),

          };
          const loading = Swal.fire(loadingSwalObject);
          fetch(urlReset, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify(params),
          })
          .then(response => {
            return response.json();
          })
          .then(jsonResponse => {
            if (jsonResponse.errors) {
              showFormErrors(jsonResponse.errors);
            } else {
                showSucessMessageWithTimeout(jsonResponse.msg, 1.4)
                .then(() => location.replace(jsonResponse.url));
            }
          })
          .catch(error => showGenericError(error))
          .finally(() => loading.close());
        });

        </script>
     


</body>

</html>
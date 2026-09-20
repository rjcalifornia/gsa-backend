@extends('layouts.app')
@section('title')
    Categorias
@endsection

@section('section-title')
    Categorias


@endsection


@section('content')
    <div class="main-card mb-3 card">
        <div class="card-header">Administrar Categorias
            <div class="btn-actions-pane-right">
                <button class="  btn-hover-shine btn btn-shadow btn-primary "  data-toggle="modal" data-target="#exampleModal">Agregar categoria
                </button>
            </div>
        </div>
        <div class="card-body">

            <table style="width: 100%;" id="example" class="table table-hover table-striped table-bordered">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nombre</th>

                        <th>Opciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Tiger Nixon</td>
                        <td>System Architect</td>
                        <td>Edinburgh</td>

                    </tr>

                </tbody>
                <tfoot>
                    <tr>
                        <th>#</th>
                        <th>Nombre</th>

                        <th>Opciones</th>

                    </tr>
                </tfoot>
            </table>
        </div>
    </div>

@endsection
 

@section('modals')
<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <p class="mb-0">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger" data-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary">Guardar</button>
            </div>
        </div>
    </div>
</div>
@endsection
<?php

namespace App\Http\Controllers\main;

use App\Http\Controllers\Controller;
use App\Models\Categories;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
   public function list()
    {
        $data = Categories::all();
        Log::info("Categorias");
        Log::info($data);
        return view('app/catalogs/categories/list');
    }
}

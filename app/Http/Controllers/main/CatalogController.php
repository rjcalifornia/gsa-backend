<?php

namespace App\Http\Controllers\main;

use App\Http\Controllers\Controller;
use App\Models\Categories;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
   public function listCategories()
    {
        $data = Categories::all();
        Log::info("Categorias");
        Log::info($data);
        return view('app/catalogs/categories/list');
    }

    public function addCategory(Request $request)
    {
        $category = new Categories();
        $category->name = $request->name; 
        $category->save();

        return redirect()->route('listCategories');
    }
}

<?php

namespace App\Http\Controllers\auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
  public function loginScreen()
  {
     if (Auth::check()) {
        return redirect()->route('homepage');
    }
    return view('auth/login');
  }

  public function authenticate(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'username' => 'required|string',
      'password' => 'required|string',
    ]);


    if ($validator->fails()) {
      return response()->json(['errors' => ['No se puede procesar la solicitud. Faltan campos']], 422);
    }

    $user = User::where('username', $request->username)->where('active', true)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
      return response()->json(['errors' => ['Por favor, verifique los datos ingresados e intente nuevamente']], 401);
    }  

    if($user){
      Auth::login($user);
      $request->session()->regenerate();

      return response()->json([
        'msg' => 'Credenciales correctas',
        'url' => route('homepage'),
      ]);}
     
  }

   public function logout(Request $request)
    {
        Auth::logout(); 
        return redirect('/');
    }

}

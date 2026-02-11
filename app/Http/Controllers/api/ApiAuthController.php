<?php
namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;
use App\Services\UserService;
use App\Models\User;



class ApiAuthController
{
     protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function login(Request $request){
        $validator = Validator::make($request->all(),[
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['mensaje' => 'No se puede procesar la solicitud. Faltan campos'], 422);
        }

        // Retrieve the user from the database based on the username
        $user = User::with(['rol'])->where('username', $request->username)->where('active', true)->first();

        // If the user is not found or the password is incorrect, return an error
        if (! $user || ! password_verify($request->password, $user->password)) {
            return response()->json(['message' => 'Verifique los datos ingresados e intente nuevamente'], 401);
        }

        // Generate a token using Sanctum
        $token = $user->createToken('auth_token', ['server:landlord'])->plainTextToken;

        // Return the token as a response
        return response()->json(['access_token' => $token,  'user' => $user], 200);
    }


      public function logout(){
        $user = Auth::user();

        /** @var \Laravel\Sanctum\HasApiTokens $user */
        $user->currentAccessToken()?->delete();
        return response()->json(['mensaje' => 'La sesion ha sido cerrada correctamente'], 201);
    }


}
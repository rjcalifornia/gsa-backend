<?php

namespace App\Http\Controllers\api;

use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;
use App\Services\UserService;
use App\Models\Team;



class ApiAuthController
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string',
        ]);



        if ($validator->fails()) {
            return response()->json(['mensaje' => 'No se puede procesar la solicitud. Faltan campos'], 422);
        }

        $user = Team::where('team_name', $request->username)->where('active', true)->first();

        if (! $user || ! password_verify($request->password, $user->pin)) {
            return response()->json(['message' => 'Por favor, verifique los datos ingresados e intente nuevamente'], 401);
        }

        $token = $user->createToken('auth_token', ['server:landlord'])->plainTextToken;

        return response()->json(['access_token' => $token,  'user' => $user], 200);
    }


    public function logout()
    {
        $user = Auth::user();

        /** @var \Laravel\Sanctum\HasApiTokens $user */
        $user->currentAccessToken()?->delete();
        return response()->json(['mensaje' => 'La sesion ha sido cerrada correctamente'], 201);
    }
}

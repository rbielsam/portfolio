<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class SetupAdmin extends Command
{
    protected $signature = 'portfolio:setup-admin';

    protected $description = 'Create the first administrator account';

    public function handle(): int
    {
        if (User::exists()) {
            $this->warn('An administrator already exists. No new account created.');
            return Command::FAILURE;
        }

        $email = $this->ask('Admin email');
        $password = $this->secret('Admin password');
        $passwordConfirmation = $this->secret('Confirm password');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email address.');
            return Command::FAILURE;
        }

        if (strlen($password) < 8) {
            $this->error('Password must be at least 8 characters.');
            return Command::FAILURE;
        }

        if ($password !== $passwordConfirmation) {
            $this->error('Passwords do not match.');
            return Command::FAILURE;
        }

        $user = User::create([
            'name' => 'Administrator',
            'email' => $email,
            'password' => Hash::make($password),
        ]);

        $this->info("Administrator created: {$user->email}");

        return Command::SUCCESS;
    }
}

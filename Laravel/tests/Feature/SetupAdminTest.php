<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SetupAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_setup_admin_creates_first_admin(): void
    {
        $this->artisan('portfolio:setup-admin')
            ->expectsQuestion('Admin email', 'admin@example.com')
            ->expectsQuestion('Admin password', 'secret12345')
            ->expectsQuestion('Confirm password', 'secret12345')
            ->expectsOutput('Administrator created: admin@example.com')
            ->assertExitCode(Command::SUCCESS);

        $user = User::where('email', 'admin@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue(Hash::check('secret12345', $user->password));
    }

    public function test_setup_admin_stores_password_hashed(): void
    {
        $this->artisan('portfolio:setup-admin')
            ->expectsQuestion('Admin email', 'admin@example.com')
            ->expectsQuestion('Admin password', 'secret12345')
            ->expectsQuestion('Confirm password', 'secret12345')
            ->assertExitCode(Command::SUCCESS);

        $user = User::where('email', 'admin@example.com')->first();
        $this->assertNotSame('secret12345', $user->password);
    }

    public function test_setup_admin_warns_if_admin_exists(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $this->artisan('portfolio:setup-admin')
            ->expectsOutput('An administrator already exists. No new account created.')
            ->assertExitCode(Command::FAILURE);

        $this->assertCount(1, User::all());
    }

    public function test_setup_admin_rejects_short_password(): void
    {
        $this->artisan('portfolio:setup-admin')
            ->expectsQuestion('Admin email', 'admin@example.com')
            ->expectsQuestion('Admin password', 'short')
            ->expectsQuestion('Confirm password', 'short')
            ->expectsOutput('Password must be at least 8 characters.')
            ->assertExitCode(Command::FAILURE);

        $this->assertCount(0, User::all());
    }
}

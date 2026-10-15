<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminUserTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);
    }

    private function editor(): User
    {
        return User::create([
            'name' => 'Editor',
            'email' => 'editor@example.com',
            'password' => Hash::make('password'),
            'role' => 'editor',
        ]);
    }

    private function reader(): User
    {
        return User::create([
            'name' => 'Reader',
            'email' => 'reader@example.com',
            'password' => Hash::make('password'),
            'role' => 'reader',
        ]);
    }

    private function fromFrontend()
    {
        return $this->withHeader('Referer', 'http://localhost:5173')
            ->withHeader('Origin', 'http://localhost:5173');
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Nuevo Usuario',
            'email' => 'nuevo@example.com',
            'role' => 'editor',
            'password' => 'secret12345',
            'password_confirmation' => 'secret12345',
        ], $overrides);
    }

    // ---------- Permisos ----------

    public function test_endpoints_require_authentication(): void
    {
        $this->getJson('/api/admin/users')->assertStatus(401);
        $this->postJson('/api/admin/users', $this->payload())->assertStatus(401);
        $this->putJson('/api/admin/users/1', $this->payload())->assertStatus(401);
        $this->deleteJson('/api/admin/users/1')->assertStatus(401);
    }

    public function test_editor_cannot_access_user_management(): void
    {
        $this->actingAs($this->editor())
            ->getJson('/api/admin/users')
            ->assertStatus(403);
    }

    public function test_reader_cannot_access_user_management(): void
    {
        $this->actingAs($this->reader())
            ->getJson('/api/admin/users')
            ->assertStatus(403);
    }

    // ---------- Listar ----------

    public function test_admin_can_list_users(): void
    {
        $admin = $this->admin();
        $this->editor();

        $response = $this->actingAs($admin)->getJson('/api/admin/users');

        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonStructure([
                '*' => ['id', 'name', 'email', 'role'],
            ]);
    }

    // ---------- Crear ----------

    public function test_admin_can_create_user(): void
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin)
            ->postJson('/api/admin/users', $this->payload());

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'name', 'email', 'role']);

        $this->assertDatabaseHas('users', [
            'email' => 'nuevo@example.com',
            'role' => 'editor',
        ]);
    }

    public function test_created_user_can_login(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->postJson('/api/admin/users', $this->payload())
            ->assertStatus(201);

        $this->fromFrontend()
            ->postJson('/api/login', [
                'email' => 'nuevo@example.com',
                'password' => 'secret12345',
            ])->assertStatus(200);
    }

    public function test_password_is_hashed_on_creation(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->postJson('/api/admin/users', $this->payload())
            ->assertStatus(201);

        $user = User::where('email', 'nuevo@example.com')->first();
        $this->assertNotSame('secret12345', $user->password);
        $this->assertTrue(Hash::check('secret12345', $user->password));
    }

    public function test_duplicate_email_is_rejected(): void
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin)
            ->postJson('/api/admin/users', $this->payload(['email' => 'admin@example.com']));

        $response->assertStatus(422)->assertJsonValidationErrors(['email']);
    }

    public function test_password_confirmation_is_required(): void
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin)
            ->postJson('/api/admin/users', $this->payload([
                'password' => 'secret12345',
                'password_confirmation' => 'distinta',
            ]));

        $response->assertStatus(422)->assertJsonValidationErrors(['password']);
    }

    public function test_invalid_role_is_rejected(): void
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin)
            ->postJson('/api/admin/users', $this->payload(['role' => 'superadmin']));

        $response->assertStatus(422)->assertJsonValidationErrors(['role']);
    }

    public function test_short_password_is_rejected(): void
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin)
            ->postJson('/api/admin/users', $this->payload([
                'password' => 'corta',
                'password_confirmation' => 'corta',
            ]));

        $response->assertStatus(422)->assertJsonValidationErrors(['password']);
    }

    // ---------- Editar ----------

    public function test_admin_can_update_user(): void
    {
        $admin = $this->admin();
        $target = $this->editor();

        $response = $this->actingAs($admin)
            ->putJson("/api/admin/users/{$target->id}", [
                'name' => 'Nombre Cambiado',
                'role' => 'reader',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $target->id,
            'name' => 'Nombre Cambiado',
            'role' => 'reader',
        ]);
    }

    public function test_admin_can_change_password(): void
    {
        $admin = $this->admin();
        $target = $this->editor();

        $this->actingAs($admin)
            ->putJson("/api/admin/users/{$target->id}", [
                'password' => 'nueva-clave-99',
                'password_confirmation' => 'nueva-clave-99',
            ])
            ->assertStatus(200);

        $this->assertTrue(
            Hash::check('nueva-clave-99', $target->fresh()->password)
        );
    }

    public function test_password_is_optional_on_update(): void
    {
        $admin = $this->admin();
        $target = $this->editor();
        $before = $target->password;

        $this->actingAs($admin)
            ->putJson("/api/admin/users/{$target->id}", ['name' => 'Solo Nombre'])
            ->assertStatus(200);

        $this->assertSame($before, $target->fresh()->password);
    }

    // ---------- Eliminar ----------

    public function test_admin_can_delete_user(): void
    {
        $admin = $this->admin();
        $target = $this->editor();

        $this->actingAs($admin)
            ->deleteJson("/api/admin/users/{$target->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('users', ['id' => $target->id]);
    }

    public function test_admin_cannot_delete_itself(): void
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin)
            ->deleteJson("/api/admin/users/{$admin->id}");

        $response->assertStatus(422);
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_deleted_user_cannot_login(): void
    {
        $admin = $this->admin();
        $target = $this->editor();

        $this->actingAs($admin)
            ->deleteJson("/api/admin/users/{$target->id}")
            ->assertStatus(200);

        $this->fromFrontend()
            ->postJson('/api/login', [
                'email' => 'editor@example.com',
                'password' => 'password',
            ])->assertStatus(401);
    }
}

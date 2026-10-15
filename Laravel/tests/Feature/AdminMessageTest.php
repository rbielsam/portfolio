<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminMessageTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);
    }
    private function fromFrontend()
    {
        return $this->withHeader('Referer', 'http://localhost:5173');
    }


    private function createMessage(array $overrides = []): ContactMessage
    {
        return ContactMessage::create(array_merge([
            'name' => 'Ana',
            'email' => 'ana@example.com',
            'message' => 'Mensaje de prueba',
        ], $overrides));
    }

    public function test_listing_messages_requires_authentication(): void
    {
        $this->getJson('/api/admin/messages')->assertStatus(401);
    }

    public function test_marking_read_requires_authentication(): void
    {
        $message = $this->createMessage();

        $this->putJson("/api/admin/messages/{$message->id}/read")->assertStatus(401);
    }

    public function test_deleting_requires_authentication(): void
    {
        $message = $this->createMessage();

        $this->deleteJson("/api/admin/messages/{$message->id}")->assertStatus(401);

        $this->assertDatabaseHas('contact_messages', ['id' => $message->id]);
    }

    public function test_admin_can_list_messages(): void
    {
        $admin = $this->createAdmin();
        $this->createMessage(['name' => 'Ana', 'email' => 'ana@example.com']);

        $response = $this->fromFrontend()->actingAs($admin)->getJson('/api/admin/messages');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonStructure([
                '*' => ['id', 'name', 'email', 'message', 'is_read', 'created_at'],
            ]);
    }

    public function test_admin_can_mark_message_as_read(): void
    {
        $admin = $this->createAdmin();
        $message = $this->createMessage();

        $response = $this->fromFrontend()->actingAs($admin)->putJson("/api/admin/messages/{$message->id}/read");

        $response->assertStatus(200);
        $this->assertTrue($message->fresh()->is_read);
    }

    public function test_marking_non_existing_message_returns_404(): void
    {
        $admin = $this->createAdmin();

        $this->fromFrontend()->actingAs($admin)->putJson('/api/admin/messages/9999/read')->assertStatus(404);
    }

    public function test_admin_can_delete_message(): void
    {
        $admin = $this->createAdmin();
        $message = $this->createMessage();

        $response = $this->fromFrontend()->actingAs($admin)->deleteJson("/api/admin/messages/{$message->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('contact_messages', ['id' => $message->id]);
    }

    public function test_public_cannot_read_any_message(): void
    {
        $this->createMessage();

        $this->getJson('/api/admin/messages')->assertStatus(401);
        $this->assertDatabaseCount('contact_messages', 1);
    }
}

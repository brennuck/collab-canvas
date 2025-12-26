-- CreateEnum
CREATE TYPE "BoardRole" AS ENUM ('viewer', 'editor', 'admin');

-- CreateEnum
CREATE TYPE "ElementType" AS ENUM ('freehand', 'shape', 'sticky_note', 'text', 'image', 'connector');

-- CreateEnum
CREATE TYPE "AITaskType" AS ENUM ('suggest_diagram', 'summarize_notes', 'generate_image', 'auto_organize');

-- CreateEnum
CREATE TYPE "AITaskStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_members" (
    "id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "BoardRole" NOT NULL DEFAULT 'editor',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "board_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_invites" (
    "id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "role" "BoardRole" NOT NULL DEFAULT 'editor',
    "expires_at" TIMESTAMP(3),
    "max_uses" INTEGER,
    "use_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "board_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elements" (
    "id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "type" "ElementType" NOT NULL,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "z_index" INTEGER NOT NULL DEFAULT 0,
    "content" JSONB NOT NULL DEFAULT '{}',
    "style" JSONB,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "locked_by" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "elements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "element_id" TEXT,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "x" DOUBLE PRECISION,
    "y" DOUBLE PRECISION,
    "parent_id" TEXT,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tasks" (
    "id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "AITaskType" NOT NULL,
    "status" "AITaskStatus" NOT NULL DEFAULT 'pending',
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "ai_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "boards_owner_id_idx" ON "boards"("owner_id");

-- CreateIndex
CREATE INDEX "board_members_board_id_idx" ON "board_members"("board_id");

-- CreateIndex
CREATE INDEX "board_members_user_id_idx" ON "board_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "board_members_board_id_user_id_key" ON "board_members"("board_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "board_invites_code_key" ON "board_invites"("code");

-- CreateIndex
CREATE INDEX "board_invites_board_id_idx" ON "board_invites"("board_id");

-- CreateIndex
CREATE INDEX "board_invites_code_idx" ON "board_invites"("code");

-- CreateIndex
CREATE INDEX "elements_board_id_idx" ON "elements"("board_id");

-- CreateIndex
CREATE INDEX "elements_board_id_z_index_idx" ON "elements"("board_id", "z_index");

-- CreateIndex
CREATE INDEX "elements_created_by_idx" ON "elements"("created_by");

-- CreateIndex
CREATE INDEX "comments_board_id_idx" ON "comments"("board_id");

-- CreateIndex
CREATE INDEX "comments_element_id_idx" ON "comments"("element_id");

-- CreateIndex
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");

-- CreateIndex
CREATE INDEX "comments_parent_id_idx" ON "comments"("parent_id");

-- CreateIndex
CREATE INDEX "ai_tasks_board_id_idx" ON "ai_tasks"("board_id");

-- CreateIndex
CREATE INDEX "ai_tasks_user_id_idx" ON "ai_tasks"("user_id");

-- CreateIndex
CREATE INDEX "ai_tasks_status_idx" ON "ai_tasks"("status");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_invites" ADD CONSTRAINT "board_invites_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elements" ADD CONSTRAINT "elements_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elements" ADD CONSTRAINT "elements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_element_id_fkey" FOREIGN KEY ("element_id") REFERENCES "elements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

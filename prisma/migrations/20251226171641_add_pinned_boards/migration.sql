-- CreateTable
CREATE TABLE "pinned_boards" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "pinned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pinned_boards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pinned_boards_user_id_idx" ON "pinned_boards"("user_id");

-- CreateIndex
CREATE INDEX "pinned_boards_board_id_idx" ON "pinned_boards"("board_id");

-- CreateIndex
CREATE UNIQUE INDEX "pinned_boards_user_id_board_id_key" ON "pinned_boards"("user_id", "board_id");

-- AddForeignKey
ALTER TABLE "pinned_boards" ADD CONSTRAINT "pinned_boards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinned_boards" ADD CONSTRAINT "pinned_boards_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/AppLayout.vue';
import { GameStatus, Settings, Sweeper } from '@/sweeper/Sweeper';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/vue3';
import { ref } from 'vue';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Minesweeper',
        href: route('minesweeper'),
    },
];

const settings = ref<Settings>({
    cols: 40,
    rows: 10,
    mines: 20,
});

const initializeGame = () => {
    game.value = new Sweeper(settings.value);
};
const game = ref<Sweeper>(new Sweeper({ ...settings.value }));
</script>

<template>
    <Head title="Minesweeper" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="relative flex h-full flex-1 flex-col rounded-xl p-4">
            <Dialog>
                <DialogTrigger>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger as-child>
                                <Button class="fixed right-5 top-5 w-fit rounded-full" variant="outline">
                                    <!--                                    <SettingsIcon />-->
                                    {{ game.settings.cols }} × {{ game.settings.rows }} ({{ game.settings.mines }})
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Game settings</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </DialogTrigger>
                <DialogContent class="sm:max-w-[425px]">
                    <form @submit.prevent="initializeGame">
                        <DialogHeader>
                            <DialogTitle>Game settings</DialogTitle>
                            <DialogDescription> Configure the size of the board</DialogDescription>
                        </DialogHeader>
                        <div class="grid gap-4 py-4">
                            <div class="grid grid-cols-4 items-center gap-4">
                                <Label for="width" class="text-right"> Width </Label>
                                <Input
                                    id="width"
                                    type="number"
                                    v-model="settings.cols"
                                    class="col-span-3"
                                />
                            </div>
                            <div class="grid grid-cols-4 items-center gap-4">
                                <Label for="height" class="text-right"> Height </Label>
                                <Input
                                    id="height"
                                    type="number"
                                    v-model="settings.rows"
                                    class="col-span-3"
                                />
                            </div>
                            <div class="grid grid-cols-4 items-center gap-4">
                                <Label for="mines" class="text-right"> Mines </Label>
                                <Input
                                    id="mines"
                                    type="number"
                                    v-model="settings.mines"
                                    class="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose as-child>
                                <Button type="submit"> Save changes</Button>
                            </DialogClose>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <div class="fixed top-2">{{ game.status }}</div>
            <div class="flex flex-1 select-none items-center justify-center">
                <div
                    class="grid border-t border-l border-gray-400 shadow-lg"
                    :style="[
                        `grid-template-rows: repeat(${game.settings.rows}, minmax(0, 1fr));`,
                        `grid-template-columns: repeat(${game.settings.cols}, minmax(0, 1fr));`
                    ]"
                >
                    <div
                        v-for="tile in game.tiles"
                        :key="`${tile.x},${tile.y}`"
                        class="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-b border-gray-400"
                        :class="{
                            'bg-gray-200': !tile.revealed,
                            'bg-gray-50': tile.revealed,
                        }"
                        @click.exact="game.reveal(tile)"
                        @click.shift="game.flag(tile)"

                    >
                        <div v-if="tile.flagged" :class="{'text-green-600': game.status === GameStatus.WON}">
                            <svg class="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    fill="currentColor"
                                    d="M5.75 1a.75.75 0 0 1 .75.75V3.6l1.72-.344a8.7 8.7 0 0 1 4.925.452l.204.081a8 8 0 0 0 4.91.334a1.2 1.2 0 0 1 1.491 1.164v7.367c0 .644-.439 1.206-1.064 1.362l-.214.053a8.68 8.68 0 0 1-5.327-.361a8.7 8.7 0 0 0-4.924-.452L6.5 13.6v8.15a.75.75 0 0 1-1.5 0v-20A.75.75 0 0 1 5.75 1"
                                />
                            </svg>
                        </div>
                        <div v-else-if="tile.revealed">
                            <span v-if="tile.isMine">
                                <svg class="h-5 w-5 text-red-600" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        fill="currentColor"
                                        d="M8.65 22.8q-3.125 0-5.312-2.212T1.15 15.25t2.163-5.288T8.6 7.8h.325L9.6 6.625q.3-.55.9-.712t1.15.162l.75.425l.125-.2q.575-1.075 1.8-1.4t2.3.3l.875.5l-1 1.725l-.875-.5q-.35-.2-.763-.088t-.612.463l-.125.2l1 .575q.525.3.688.9t-.138 1.125L15 11.3q.575.9.863 1.913t.287 2.087q0 3.125-2.187 5.313T8.65 22.8M20 8.8v-2h3v2zm-5.5-5.5v-3h2v3zm4.875 2.025l-1.4-1.4L20.1 1.8l1.4 1.4z"
                                    />
                                </svg>
                            </span>
                            <span v-else-if="tile.adjacentMines > 0">{{ tile.adjacentMines }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

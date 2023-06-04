import { createSelector, createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import { useHttp } from '../../hooks/http.hook'; //для того чтобы делать запрос

const heroesAdapter = createEntityAdapter();  //createEntityAdapter


const initialState = heroesAdapter.getInitialState({ //позволяет создавать начальное состояние 
    heroesLoadingStatus: 'idle'
}); //createEntityAdapter

export const fetchHeroes = createAsyncThunk (
    'heroes/fetchHeroes',
    async () => {
        const {request} = useHttp();
        return await request("http://localhost:3001/heroes")
    }
)

const heroesSlice = createSlice({
    name: 'heroes',
    initialState,
    reducers: {
        heroCreated: (state, action) => {
            // state.heroes.push(action.payload)
            heroesAdapter.addOne(state, action.payload);  //createEntityAdapter
        },
        heroDeleted: (state, action) => {
            // state.heroes = state.heroes.filter(item => item.id !== action.payload)
            heroesAdapter.removeOne(state, action.payload)  //createEntityAdapter
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchHeroes.pending, state => {
                state.heroesLoadingStatus = 'loading'
            })
            .addCase(fetchHeroes.fulfilled, (state, action) => {
                state.heroesLoadingStatus = 'idle';
                // state.heroes = action.payload;
                heroesAdapter.setAll(state, action.payload)       //createEntityAdapter
            })
            .addCase(fetchHeroes.rejected, state => {
                state.heroesLoadingStatus = 'error'
            })
            .addDefaultCase(() => {}) // ничего делать не будет 
    }
});

const {actions, reducer} = heroesSlice;

export default reducer

//
const {selectAll} = heroesAdapter.getSelectors(state => state.heroes) //createEntityAdapter

export const filteredHeroesSelector = createSelector(
    (state) => state.filters.activeFilter,
    // (state) => state.heroes.heroes,
    selectAll,                          //createEntityAdapter
    (filter, heroes) => {
        if (filter === 'all') { // Если у всех стоит all то мы возвразаем просто полный масив
            return heroes
        } else {
            return heroes.filter(item => item.element === filter) // из state вытаскиваем список героев потом мы eго фильтруем. 
                                //Если его элемент совпадает с активным фильтром то он попадает в новый массив если нет то он просто отбрасывается
                                //В итоге у нас получится новый масив который попадет в переменную filteredHeroes 
        }
    }
)

export const {
    heroesFetching,
    heroesFetched,
    heroesFetchingError,
    heroCreated,
    heroDeleted
} = actions
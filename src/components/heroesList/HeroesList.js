import { useHttp } from '../../hooks/http.hook'; //для того чтобы делать запрос
import { useEffect, useCallback } from 'react'; //для того чтобы делать правильно запрос в правильное время
import { useDispatch, useSelector } from 'react-redux'; //два хука которые используются в redux
import { createSelector } from 'reselect';

import { heroesFetching, heroesFetched, heroesFetchingError, heroDeleted } from '../../actions/index.js' //action
import HeroesListItem from "../heroesListItem/HeroesListItem";
import Spinner from '../spinner/Spinner';

// Задача для этого компонента:
// При клике на "крестик" идет удаление персонажа из общего состояния
// Усложненная задача:
// Удаление идет и с json файла при помощи метода DELETE

const HeroesList = () => {

    const filteredHeroesSelector = createSelector(
        (state) => state.filters.activeFilter,
        (state) => state.heroes.heroes,
        (filter, heroes) => {
            if (filter === 'all') { // Если у всех стоит all то мы возвразаем просто полный масив
                return heroes
            } else {
                return heroes.filter(item => item.element === filter) // из state вытаскиваем список героев потом мы кго фильтруем. 
                                    //Если его элемент совпадает с активным фильтром то он ропадает в новый массив если нет то он просто отбрасывается
                                    //В итоге у нас получится новый масив который попадет в переменную filteredHeroes 
            }
        }
    )

    // const filteredHeroes = useSelector(state => {
    //     if (state.filters.activeFilter === 'all') { // Если у всех стоит all то мы возвразаем просто полный масив
    //         return state.heroes.heroes;
    //     } else {
    //         return state.heroes.heroes.filter(item => item.element === state.filters.activeFilter) // из state вытаскиваем список героев потом мы кго фильтруем. 
    //                             //Если его элемент совпадает с активным фильтром то он ропадает в новый массив если нет то он просто отбрасывается
    //                             //В итоге у нас получится новый масив который попадет в переменную filteredHeroes 
    //     }
    // })

    const filteredHeroes = useSelector(filteredHeroesSelector)
    const heroesLoadingStatus = useSelector(state => state.heroesLoadingStatus);
    const dispatch = useDispatch();
    const {request} = useHttp();

    useEffect(() => {
        dispatch(heroesFetching());
        request("http://localhost:3001/heroes")
            .then(data => dispatch(heroesFetched(data)))
            .catch(() => dispatch(heroesFetchingError()))

        // eslint-disable-next-line
    }, []);

    // Функция берет id и по нему удаляет ненужного персонажа из store
    // ТОЛЬКО если запрос на удаление прошел успешно
    // Отслеживайте цепочку действий actions => reducers
    const onDelete = useCallback((id) => {
        // Удаление персонажа по его id
        request(`http://localhost:3001/heroes/${id}`, "DELETE")
            .then(data => console.log(data, 'Deleted'))
            .then(dispatch(heroDeleted(id)))
            .catch(err => console.log(err));
        // eslint-disable-next-line  
    }, [request]);

    if (heroesLoadingStatus === "loading") {
        return <Spinner/>;
    } else if (heroesLoadingStatus === "error") {
        return <h5 className="text-center mt-5">Ошибка загрузки</h5>
    }
    

    if (heroesLoadingStatus === "loading") {
        return <Spinner/>;
    } else if (heroesLoadingStatus === "error") {
        return <h5 className="text-center mt-5">Ошибка загрузки</h5>
    }

    const renderHeroesList = (arr) => {
        if (arr.length === 0) {
            return <h5 className="text-center mt-5">Героев пока нет</h5>
        }


        return arr.map(({id, ...props}) => {
            return (
                <HeroesListItem 
                    key={id}
                    {...props}
                    onDelete={() => onDelete(id)}/>
            )
        })

    }

    const elements = renderHeroesList(filteredHeroes);
    return (
        <ul>
            {elements}
        </ul>
    )
}

export default HeroesList;

